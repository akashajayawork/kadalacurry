import type { RowInput } from "jspdf-autotable";

import { APP_NAME } from "@/constants/app";
import type { Settlement } from "@/types";
import { formatDateId, formatFullDate, formatTime, parseDateId } from "@/utils/date";

type Rgb = [number, number, number];

const MARGIN = 40;
const TEXT: Rgb = [29, 29, 31];
const MUTED: Rgb = [110, 110, 115];
const DAY_FILL: Rgb = [245, 245, 247];
const RULE: Rgb = [229, 229, 234];

/** The PDF's built-in font only covers Latin-1, so replace anything else (₹, emoji, narrow spaces). */
function pdfText(text: string): string {
  return text.replace(/[^\S\n]+/g, " ").replace(/[^\n\x20-\x7e\xa1-\xff]/g, "?");
}

const pdfAmount = (amount: number) => `Rs. ${amount.toLocaleString("en-IN")}`;

const sumAmounts = (settlements: Settlement[]) =>
  settlements.reduce((total, settlement) => total + settlement.amount, 0);

function describe(settlement: Settlement): [title: string, details: string] {
  if (settlement.kind === "bill") {
    return [
      `${settlement.paidByName} paid the meal bill`,
      settlement.shares.map((share) => `${share.name}: ${pdfAmount(share.amount)}`).join("\n"),
    ];
  }

  return [
    `${settlement.fromName} paid ${settlement.toName}`,
    `Repayment, recorded by ${settlement.createdByName}`,
  ];
}

/** Groups settlements by the day they were made, keeping their order. */
function groupByDay(settlements: Settlement[]): Map<string, Settlement[]> {
  const groups = new Map<string, Settlement[]>();

  for (const settlement of settlements) {
    const dateId = settlement.dateId || formatDateId(settlement.createdAt ?? new Date());
    groups.set(dateId, [...(groups.get(dateId) ?? []), settlement]);
  }

  return groups;
}

/** Builds a day-by-day PDF of the given settlements (oldest first) and downloads it. */
export async function downloadPaymentHistoryPdf(settlements: Settlement[]): Promise<void> {
  // Loaded on demand so the PDF library stays out of the main bundle.
  const [{ jsPDF }, { autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const generatedAt = new Date();
  const bills = settlements.filter((settlement) => settlement.kind === "bill");
  const repayments = settlements.filter((settlement) => settlement.kind === "repayment");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(22);
  pdf.setTextColor(...TEXT);
  pdf.text(APP_NAME, MARGIN, 60);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  pdf.setTextColor(...MUTED);
  pdf.text(
    pdfText(`Payment history - generated ${formatFullDate(generatedAt)}, ${formatTime(generatedAt)}`),
    MARGIN,
    80
  );
  pdf.text(
    `Bills paid: ${bills.length} (${pdfAmount(sumAmounts(bills))})    ` +
      `Repayments: ${repayments.length} (${pdfAmount(sumAmounts(repayments))})`,
    MARGIN,
    97
  );

  const body: RowInput[] = [];

  for (const [dateId, daySettlements] of groupByDay(settlements)) {
    body.push([
      {
        content: pdfText(formatFullDate(parseDateId(dateId))),
        colSpan: 4,
        styles: { fontStyle: "bold", fillColor: DAY_FILL },
      },
    ]);

    for (const settlement of daySettlements) {
      const [title, details] = describe(settlement);

      body.push([
        settlement.createdAt ? pdfText(formatTime(settlement.createdAt)) : "",
        pdfText(title),
        pdfText(details),
        pdfAmount(settlement.amount),
      ]);
    }
  }

  autoTable(pdf, {
    startY: 116,
    head: [["Time", "Settlement", "Details", { content: "Amount", styles: { halign: "right" } }]],
    body,
    theme: "plain",
    margin: { left: MARGIN, right: MARGIN, bottom: 50 },
    styles: {
      font: "helvetica",
      fontSize: 10,
      cellPadding: 7,
      textColor: TEXT,
      lineColor: RULE,
      lineWidth: { bottom: 0.5 },
    },
    headStyles: { fontStyle: "bold", textColor: MUTED },
    columnStyles: {
      0: { cellWidth: 62 },
      3: { cellWidth: 84, halign: "right", fontStyle: "bold" },
    },
    didDrawPage: ({ pageNumber }) => {
      pdf.setFontSize(9);
      pdf.setTextColor(...MUTED);
      pdf.text(
        `Page ${pageNumber}`,
        pdf.internal.pageSize.getWidth() - MARGIN,
        pdf.internal.pageSize.getHeight() - 24,
        { align: "right" }
      );
    },
  });

  pdf.save(`${APP_NAME}-payment-history-${formatDateId(generatedAt)}.pdf`);
}
