import { useEffect, useState } from "react";
import { Shield, AlertCircle } from "react-feather";
import { useLocation, useNavigate } from "react-router-dom";

import { supabase } from "../../utils/supabase";
import { getCurrentUserService } from "../../features/auth/services/authServices";

const AccountUnderReview = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [suspension, setSuspension] = useState(location.state || {});
  const [timeLeft, setTimeLeft] = useState("");
  const [loading, setLoading] = useState(true);

  const {
    suspensionType,
    suspensionReason,
    suspendedUntil,
  } = suspension;

  const isTemporary = suspensionType === "temporary";
  const isPermanent = suspensionType === "permanent";

  useEffect(() => {
    let channel;

    const loadProfile = async () => {
      const user = await getCurrentUserService();

      if (!user) {
        navigate("/login", { replace: true });
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select(
          "isSuspended, suspensionType, suspensionReason, suspendedUntil",
        )
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error loading profile:", error);
        setLoading(false);
        return;
      }

      if (!profile?.isSuspended) {
        navigate("/", { replace: true });
        return;
      }

      setSuspension({
        suspensionType: profile.suspensionType,
        suspensionReason: profile.suspensionReason,
        suspendedUntil: profile.suspendedUntil,
      });

      setLoading(false);

      channel = supabase
        .channel(`account-status-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "profiles",
            filter: `id=eq.${user.id}`,
          },
          (payload) => {
            const profile = payload.new;

            console.log("Profile updated:", profile);

            // Account restored
            if (!profile.isSuspended) {
              navigate("/", { replace: true });
              return;
            }

            // Suspension changed
            setSuspension({
              suspensionType: profile.suspensionType,
              suspensionReason: profile.suspensionReason,
              suspendedUntil: profile.suspendedUntil,
            });
          },
        )
        .subscribe((status) => {
          console.log("Realtime status:", status);
        });
    };

    loadProfile();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [navigate]);

  // Temporary suspension timer
  useEffect(() => {
    if (!isTemporary || !suspendedUntil) {
      setTimeLeft("");
      return;
    }

    let restoring = false;

    const updateTimer = async () => {
      const difference =
        new Date(suspendedUntil).getTime() - Date.now();

      if (difference <= 0) {
        setTimeLeft("Suspension period has ended.");

        if (restoring) {
          return;
        }

        restoring = true;

        const user = await getCurrentUserService();

        if (!user) {
          return;
        }

        const { error } = await supabase
          .from("profiles")
          .update({
            isSuspended: false,
            suspensionType: null,
            suspensionReason: null,
            suspendedAt: null,
            suspendedUntil: null,
          })
          .eq("id", user.id);

        if (error) {
          console.error("Error restoring account:", error);
          restoring = false;
          return;
        }

        navigate("/", { replace: true });

        return;
      }

      const days = Math.floor(
        difference / (1000 * 60 * 60 * 24),
      );

      const hours = Math.floor(
        (difference / (1000 * 60 * 60)) % 24,
      );

      const minutes = Math.floor(
        (difference / (1000 * 60)) % 60,
      );

      const seconds = Math.floor(
        (difference / 1000) % 60,
      );

      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };

    updateTimer();

    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [isTemporary, suspendedUntil, navigate]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  return (
    <div
      className="d-flex justify-content-center align-items-center bg-light px-3"
      style={{ minHeight: "100vh" }}
    >
      <div
        className="bg-white rounded-4 shadow-sm text-center p-4 p-md-5"
        style={{ maxWidth: "520px", width: "100%" }}
      >
        {/* Icon */}
        <div
          className="d-flex justify-content-center align-items-center rounded-circle mx-auto mb-4"
          style={{
            width: "80px",
            height: "80px",
            backgroundColor: "#e7f1ff",
          }}
        >
          <Shield size={40} className="text-primary" />
        </div>

        {/* Title */}
        <h2 className="fw-bold mb-3">
          {isTemporary
            ? "Account Temporarily Suspended"
            : isPermanent
              ? "Account Permanently Suspended"
              : "Account Under Review"}
        </h2>

        {/* Message */}
        <p className="text-muted mb-4" style={{ lineHeight: "1.6" }}>
          {isTemporary
            ? "Your account has been temporarily suspended following a review of community reports."
            : isPermanent
              ? "Your account has been permanently suspended following a review of community reports."
              : "Your account is under review due to multiple community reports."}
        </p>

        {/* Timer */}
        {isTemporary && suspendedUntil && (
          <div className="alert alert-warning border rounded-3 mb-3">
            <div className="fw-semibold mb-2">
              Time Remaining
            </div>

            <h4 className="fw-bold mb-2">
              {timeLeft}
            </h4>

            <small className="text-muted">
              Suspended until{" "}
              {new Date(suspendedUntil).toLocaleString()}
            </small>
          </div>
        )}

        {/* Admin Reason */}
        {suspensionReason && (
          <div className="alert alert-light border rounded-3 text-start">
            <small className="text-muted d-block mb-1">
              Admin Reason
            </small>

            <span>{suspensionReason}</span>
          </div>
        )}

        {/* Notice */}
        <div className="alert alert-light border rounded-3 d-flex align-items-start text-start mb-0">
          <AlertCircle
            size={20}
            className="text-primary me-2 flex-shrink-0 mt-1"
          />

          <small className="text-muted">
            {isTemporary
              ? "You won't be able to access your account until the suspension period ends."
              : isPermanent
                ? "You won't be able to access your account because your account has been permanently suspended."
                : "You won't be able to access your account while it is under review."}
          </small>
        </div>
      </div>
    </div>
  );
};

export default AccountUnderReview;
