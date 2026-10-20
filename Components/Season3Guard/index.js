import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { auth } from "../../firebase";
import { usersDb } from "../../lib/db";
import { useSettings } from "../../lib/useSettings";

// Wraps a Season 3 page: visible to everyone while "Season 3 pages" is on, otherwise admins only.
// Non-admins are sent to the home page. The page (and its data fetching) only runs once allowed.
const withSeason3Guard = (Page) => {
  const GuardedPage = (props) => {
    const router = useRouter();
    const { settings, loaded } = useSettings();
    const [isAdmin, setIsAdmin] = useState(false);
    const [adminChecked, setAdminChecked] = useState(false);

    useEffect(() => {
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        let admin = false;
        try {
          admin = user ? !!(await usersDb.get(user.uid))?.isAdmin : false;
        } catch (error) {
          console.error("Error checking admin access:", error);
        }
        setIsAdmin(admin);
        setAdminChecked(true);
      });
      return () => unsubscribe();
    }, []);

    const ready = loaded && adminChecked;
    const allowed = ready && (settings.season3Visible || isAdmin);

    useEffect(() => {
      if (ready && !allowed) router.replace("/");
    }, [ready, allowed, router]);

    return allowed ? <Page {...props} /> : null;
  };
  return GuardedPage;
};

export default withSeason3Guard;
