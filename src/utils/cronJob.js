const cron = require("node-cron");
const { subDays, startOfDay, endOfDay } = require("date-fns"); // alternative "moment"
const ConnectionRequest = require("../models/connectionRequest");
const { sendTestEmail } = require("../services/sendMail");

cron.schedule("* * * * *", async () => {
  console.log("⏰ CRON JOB RUNNING at", new Date().toISOString());
  try {
    const yesterday = subDays(new Date(), 1);

    const yesterdayStart = startOfDay(yesterday);
    const yesterdayEnd = endOfDay(yesterday);

    const pendingRequests = await ConnectionRequest.find({
      status: "interested",
      createdAt: {
        $gte: yesterdayStart,
        $lt: yesterdayEnd,
      },
    }).populate("fromUserId toUserId");

    for (const request of pendingRequests) {
      const toUser = request.toUserId;
      const fromUser = request.fromUserId;

      if (!toUser?.emailId || !fromUser?.firstName) continue;

      const fullMessage = `
    Hi ${toUser.firstName},

    You have received a new connection request on Code Swipe!

    Details:
    - Name: ${fromUser.firstName} ${fromUser.lastName || ""}
    - Email: ${fromUser.emailId}
    - About: ${fromUser.about || "Not provided"}

    Log in now to view the request.

    Happy coding!
    – Code Swipe Team
  `;

      try {
        await sendTestEmail(toUser.emailId, "Pending Request!", fullMessage);
      } catch (error) {
        console.error(`Failed to send email to ${toUser.emailId}:`, error);
      }
    }

  } catch (error) {
    console.error(error);
  }
});
