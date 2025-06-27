export const log = async (
  stack: "frontend",
  level: "info" | "warn" | "error" | "debug" | "fatal",
  pkg: "api" | "component" | "hook" | "page" | "state" | "style" | "auth" | "config" | "middleware" | "utils",
  message: string,
  token: string
) => {
  try {
    const response = await fetch("http://20.244.56.144/evaluation-service/logs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ stack, level, package: pkg, message }),
    });

    const data = await response.json();
    console.log("Log sent:", data);
  } catch (error) {
    console.error("Logging failed:", error);
  }
};
