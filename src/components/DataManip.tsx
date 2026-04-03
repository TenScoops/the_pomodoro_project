import axios from "axios";
import { useEffect, useState } from "react";

type DataManipProps = {
  rating: number | null;
  time_worked: number | null;
};

/** Legacy hook for a separate auth server; not wired into the main UI yet. */
export function DataManip({ rating, time_worked }: DataManipProps) {
  const [userId, setUserId] = useState<string | null>(null);
  const [, setDate] = useState(Date.now());

  const fetchUserId = async () => {
    try {
      const response = await axios.get("http://localhost:3000/auth/user");
      const userData = response.data as { loggedIn?: boolean; user_id?: string };
      if (userData.loggedIn && userData.user_id) {
        setUserId(userData.user_id);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const sendBack = async () => {
    await axios.post("http://localhost:3000/activity/addActivity");
  };

  useEffect(() => {
    void fetchUserId();
  }, []);

  useEffect(() => {
    if (userId !== null && rating !== null && time_worked !== null) {
      setDate(Date.now());
      void sendBack();
    }
  }, [userId, rating, time_worked]);

  return null;
}
