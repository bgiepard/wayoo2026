import type { FieldSet, Record as AirtableRecord } from "airtable";
import { notificationsTable } from "@/lib/airtable";
import type { NotificationData, CreateNotificationData } from "@/models";

function mapRecordToNotification(record: AirtableRecord<FieldSet>): NotificationData {
  return {
    id: record.id,
    userId: record.get("userId") as string,
    type: record.get("type") as NotificationData["type"],
    title: record.get("title") as string,
    message: record.get("message") as string,
    link: (record.get("link") as string) || undefined,
    read: (record.get("read") as boolean) || false,
    createdAt: record.get("createdAt") as string,
  };
}

export async function createNotification(
  data: CreateNotificationData
): Promise<NotificationData> {
  const record = await notificationsTable.create({
    userId: data.userId,
    type: data.type,
    title: data.title,
    message: data.message,
    link: data.link || "",
    read: false,
    createdAt: new Date().toISOString(),
  });

  return mapRecordToNotification(record);
}

export async function getNotificationsByUserId(
  userId: string
): Promise<NotificationData[]> {
  const records = await notificationsTable
    .select({
      filterByFormula: `{userId} = '${userId}'`,
      sort: [{ field: "createdAt", direction: "desc" }],
      maxRecords: 50,
    })
    .all();

  return records.map(mapRecordToNotification);
}

export async function markNotificationAsRead(
  notificationId: string
): Promise<void> {
  await notificationsTable.update(notificationId, { read: true });
}

export async function markAllNotificationsAsRead(
  userId: string
): Promise<void> {
  const unreadNotifications = await notificationsTable
    .select({
      filterByFormula: `AND({userId} = '${userId}', {read} = FALSE())`,
    })
    .all();

  // Update all unread notifications
  const updates = unreadNotifications.map((record) => ({
    id: record.id,
    fields: { read: true },
  }));

  // Airtable allows max 10 records per update call
  for (let i = 0; i < updates.length; i += 10) {
    const batch = updates.slice(i, i + 10);
    await notificationsTable.update(batch);
  }
}

export async function deleteNotification(notificationId: string): Promise<void> {
  await notificationsTable.destroy(notificationId);
}
