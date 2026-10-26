"use client";
import { formatDate } from "@/lib/format";
import { orderStatusLabel } from "@/lib/orders/status";

/** The order's status history, newest first (template timeline markup). Used by order details and tracking. */
export default function OrderTimeline({ order }) {
  // Older orders or backends without a history still get one entry: the current status.
  const events = order.timeline?.length
    ? order.timeline
    : [{ status: order.status || "placed", date: order.createdAt }];

  return (
    <div className="widget-timeline">
      <ul className="timeline">
        {events.map((event, index) => (
          <li key={`${event.status}-${event.date ?? index}`}>
            <div className="timeline-badge success" />
            <div className="timeline-box">
              <div className="timeline-panel">
                <div className="text-2 fw-6">{event.label ?? orderStatusLabel(event.status)}</div>
                {event.date && <span>{formatDate(event.date, { withTime: true })}</span>}
              </div>
              {event.note && <p>{event.note}</p>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
