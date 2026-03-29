"use client";

import { Bell } from "lucide-react";
import { useNotificationStore } from "@/store/useNotificationStore";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTrigger,
} from "@/components/ui/drawer";

export default function NotificationCenter() {
  const { notifications, markAsRead, clearAll } = useNotificationStore();

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <button className="relative p-2 rounded-md hover:bg-muted transition">
          <Bell size={22} className="text-foreground" />

          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 text-[10px] bg-red-500 text-white px-1.5 py-[1px] rounded-full font-medium shadow">
              {unreadCount}
            </span>
          )}
        </button>
      </DrawerTrigger>

      <DrawerContent className="p-4 max-h-[80vh] overflow-y-auto">
        <DrawerHeader>
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Notifications</h2>

            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                className="text-sm text-red-400 hover:underline"
              >
                Clear All
              </button>
            )}
          </div>
        </DrawerHeader>

        <div className="space-y-2 mt-4">
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No notifications yet
            </p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markAsRead(n.id)}
                className={`p-3 rounded-md cursor-pointer border transition ${
                  n.read
                    ? "opacity-60 border-border"
                    : "bg-muted border-primary/30"
                }`}
              >
                <p className="text-sm">{n.message}</p>

                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-muted-foreground">
                    {new Date(n.timestamp).toLocaleTimeString()}
                  </span>

                  {!n.read && (
                    <span className="text-[10px] text-primary font-medium">
                      NEW
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}