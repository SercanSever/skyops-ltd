import { test, expect } from "@playwright/test";

test.describe("Full Flow", () => {
  test("should complete full drone → mission lifecycle", async ({ page }) => {
    // 1. Dashboard — fleet overview visible
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Dashboard" }),
    ).toBeVisible();
    await expect(
      page.getByText("Fleet overview and operational status"),
    ).toBeVisible();

    // 2. Navigate to Drones page
    await page.getByRole("link", { name: "Drones" }).click();
    await expect(page.getByText("Manage your drone fleet")).toBeVisible();

    // 3. Create a new drone
    await page.getByRole("button", { name: "New Drone" }).click();
    await expect(page.getByText("Create New Drone")).toBeVisible();

    const serialNumber = `SKY-E2E${String(Date.now()).slice(-1)}-TE5T`;
    await page.getByPlaceholder("SKY-XXXX-XXXX").fill(serialNumber);
    await page.getByRole("button", { name: "Create" }).click();

    // Wait for dialog to close and drone to appear in list
    await expect(page.getByText("Create New Drone")).not.toBeVisible();
    await expect(page.getByText(serialNumber)).toBeVisible();

    // 4. Navigate to Missions page
    await page.getByRole("link", { name: "Missions" }).click();
    await expect(
      page.getByText("Schedule and manage drone missions"),
    ).toBeVisible();

    // 5. Create a new mission
    await page.getByRole("button", { name: "New Mission" }).click();
    await expect(page.getByText("Create New Mission")).toBeVisible();

    await page
      .getByPlaceholder("Wind Farm Alpha Inspection")
      .fill("E2E Test Mission");
    await page.getByPlaceholder("John Doe").fill("E2E Pilot");
    await page
      .getByPlaceholder("Wind Farm Alpha", { exact: true })
      .fill("E2E Test Site");

    // Select the drone we just created
    const droneSelect = page
      .locator("select")
      .filter({ has: page.getByText("Select drone...") });
    await droneSelect.selectOption({ label: serialNumber });

    // Set future dates
    const now = new Date();
    const start = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const end = new Date(start.getTime() + 4 * 60 * 60 * 1000);
    const startStr = start.toISOString().slice(0, 16);
    const endStr = end.toISOString().slice(0, 16);

    await page.locator('input[type="datetime-local"]').first().fill(startStr);
    await page.locator('input[type="datetime-local"]').last().fill(endStr);

    await page.getByRole("button", { name: "Create Mission" }).click();

    // Wait for dialog to close and mission to appear
    await expect(page.getByText("Create New Mission")).not.toBeVisible();
    await expect(page.getByText("E2E Test Mission")).toBeVisible();

    // 6. Transition: PLANNED → PRE_FLIGHT_CHECK
    // Find the row with our mission and click its Start Pre-Flight button
    const missionRow = page
      .locator("tr")
      .filter({ hasText: "E2E Test Mission" });
    await missionRow.getByRole("button", { name: "Start Pre-Flight" }).click();

    // After transition, "Start Mission" button should appear in the same row
    await expect(
      missionRow.getByRole("button", { name: "Start Mission" }),
    ).toBeVisible();

    // 7. Transition: PRE_FLIGHT_CHECK → IN_PROGRESS
    await missionRow.getByRole("button", { name: "Start Mission" }).click();

    // After transition, "Complete" button should appear
    await expect(
      missionRow.getByRole("button", { name: "Complete" }),
    ).toBeVisible();

    // 8. Transition: IN_PROGRESS → COMPLETED
    await missionRow.getByRole("button", { name: "Complete" }).click();
    await expect(
      page.getByRole("heading", { name: "Complete Mission" }),
    ).toBeVisible();
    await page.getByPlaceholder("e.g. 2.5").fill("2.5");
    await page
      .locator("form")
      .getByRole("button", { name: "Complete" })
      .click();

    // After completing, no action buttons should remain for this mission
    await expect(
      missionRow.getByRole("button", { name: "Start Pre-Flight" }),
    ).not.toBeVisible();
    await expect(
      missionRow.getByRole("button", { name: "Complete" }),
    ).not.toBeVisible();

    // 9. Navigate back to Dashboard
    await page.getByRole("link", { name: "Dashboard" }).click();
    await expect(
      page.getByRole("heading", { name: "Dashboard" }),
    ).toBeVisible();
    await expect(
      page.getByText("Fleet overview and operational status"),
    ).toBeVisible();
  });
});
