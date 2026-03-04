/**
 * Lightspeed POS API Client
 * Handles OAuth token refresh and sale CRUD operations.
 * Adapted from Shooting Supplies — uses native fetch instead of axios.
 */

import { logger } from "../logging/logger";

const LIGHTSPEED_OAUTH_URL =
  "https://cloud.lightspeedapp.com/oauth/access_token.php";

async function refreshToken(): Promise<string> {
  const body = {
    grant_type: "refresh_token",
    client_id: process.env.LIGHTSPEED_ID,
    client_secret: process.env.LIGHTSPEED_SECRET,
    refresh_token: process.env.LIGHTSPEED_REFRESH_TOKEN,
  };

  const response = await fetch(LIGHTSPEED_OAUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    logger.error(
      { error: errorText, status: response.status },
      "Lightspeed token refresh failed:",
    );
    throw new Error(`Lightspeed token refresh failed: ${response.status}`);
  }

  const tokenData = await response.json();
  return tokenData.access_token;
}

function getBaseURL(): string {
  return `https://api.lightspeedapp.com/API/Account/${process.env.ACCOUNT_ID}/`;
}

async function lightspeedFetch<T>(
  path: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  data?: unknown,
): Promise<T> {
  const token = await refreshToken();
  const baseURL = getBaseURL();

  const options: RequestInit = {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  if (data && (method === "POST" || method === "PUT")) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(`${baseURL}${path}`, options);

  if (!response.ok) {
    const errorText = await response.text();
    logger.error(
      {
        status: response.status,
        response: errorText,
      },
      `Lightspeed ${method} ${path} failed:`,
    );
    throw new Error(`Lightspeed API error: ${response.status} — ${errorText}`);
  }

  return response.json() as Promise<T>;
}

export async function createSale(
  postData: Record<string, unknown>,
): Promise<number> {
  const result = await lightspeedFetch<{ Sale: { saleID: string } }>(
    "Sale.json",
    "POST",
    postData,
  );
  return Number(result.Sale.saleID);
}

export async function completeSale(
  saleID: string,
  amount: number,
): Promise<void> {
  const roundedAmount = Math.round(amount * 100) / 100;

  const paymentData = {
    employeeID: Number(process.env.LIGHTSPEED_EMPLOYEE_ID) || 9,
    registerID: Number(process.env.LIGHTSPEED_REGISTER_ID) || 2,
    completed: true,
    SalePayments: {
      SalePayment: {
        paymentTypeID: 9,
        amount: roundedAmount,
      },
    },
  };

  logger.info(
    paymentData,
    `Completing Lightspeed sale ${saleID} with payment data:`,
  );

  await lightspeedFetch(`Sale/${saleID}.json`, "PUT", paymentData);
}

export async function cancelSale(saleID: string): Promise<void> {
  await lightspeedFetch(
    `Sale/${saleID}.json?load_relations["SaleLines.Item"]`,
    "DELETE",
  );
}
