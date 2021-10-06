const spawnSync = require("child_process").spawnSync;
const { timeClockIn, timeClockOut } = require("./config");

const styles = {
  // got these from playing around with what I found from:
  // https://github.com/istanbuljs/istanbuljs/blob/0f328fd0896417ccb2085f4b7888dd8e167ba3fa/packages/istanbul-lib-report/lib/file-writer.js#L84-L96
  // they're the best I could find that works well for light or dark terminals
  success: { open: "\u001b[32;1m", close: "\u001b[0m" },
  danger: { open: "\u001b[31;1m", close: "\u001b[0m" },
  info: { open: "\u001b[36;1m", close: "\u001b[0m" },
  subtitle: { open: "\u001b[2;1m", close: "\u001b[0m" },
};

function color(modifier, string) {
  return styles[modifier].open + string + styles[modifier].close;
}

if (timeClockIn && timeClockOut) {
  console.log(color("info", `▶ Start scheduler for your clockIn every ${timeClockIn} and clockOut every ${timeClockOut}`));
  console.log(color("info", `▶ To see list application running within pm2 run "yarn pm2 ls"`));
  const result = spawnSync("yarn pm2 start scheduler.js --name talenta", { stdio: "inherit", shell: true });
  if (result.status === 0) {
    console.log(color("success", `✓ Your scheduler is now running"`));
    console.log(color("info", `▶ To stop the scheduler run "yarn scheduler:stop"`));
  } else {
    process.exit(result.status);
  }
} else {
  console.error(color("danger", "✖︎ Error: timeClockIn or/and timeClockOut undefined"));
  console.log(color("subtitle", `▶ Operations terminated"`));
}
