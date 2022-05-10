import "bootstrap";
import "@fortawesome/fontawesome-free/css/all.css";
import "bootstrap/dist/css/bootstrap.css";
import "./styles.scss";

var label;

const datasetCollector = require("edge-ml").datasetCollector;
var collector;

async function start(label) {
  // Generate collector function
  try {
    collector = await datasetCollector(
      "https://app.edge-ml.org",
      "iBdfBrigJ2Eb17t4qMhxjt8fwUtlatntVhLxxH3SAuVGn2mEwiYNgAxUSp37+dmI+ohq9LUpnzNAJIR36gHBuA==",
      "devices_orientation",
      false,
      { KEY: label },
      "activities_running"
    );
  } catch (e) {
    // Error occurred, cannot use the collector as a function to upload
    console.log(e);
  }
  window.addEventListener("deviceorientation", (event) => {
    try {
      if (event.alpha === null) return;

      const time =
        performance.timing.navigationStart * 1000000 + event.timeStamp;

      // time should be a unix timestamp
      collector.addDataPoint(time, "alpha", event.alpha);
      collector.addDataPoint(time, "beta", event.beta);
      collector.addDataPoint(time, "gamma", event.gamma);
      //collector.addDataPoint(time, "alpha", event.acceleration); -> mit devicemotion

      // Tells the library that all data has been recorded.
      // Uploads all remaining data points to the server
    } catch (e) {
      console.log(e);
    }
  });
  window.addEventListener("devicemotion", (event) => {
    try {
      if (event.alpha === null) return;

      const time =
        performance.timing.navigationStart * 1000000 + event.timeStamp;

      // time should be a unix timestamp
      collector.addDataPoint(time, "x", event.accelerationIncludingGravity.x);
      collector.addDataPoint(time, "y", event.accelerationIncludingGravity.y);
      collector.addDataPoint(time, "z", event.accelerationIncludingGravity.z);
      //collector.addDataPoint(time, "alpha", event.acceleration); -> mit devicemotion

      // Tells the library that all data has been recorded.
      // Uploads all remaining data points to the server
    } catch (e) {
      console.log(e);
    }
  });
}

async function stop() {
  //await collector.onComplete();
  console.log("stop");
}

document.getElementById("record").onchange = function () {
  if (this.checked) {
    console.log("start");
    label = document.getElementById("contextlabel").value;
    start(label);
    document.getElementById("debug").innerHTML = "recording...";
  } else {
    stop();
    document.getElementById("debug").innerHTML = "Not recording.";
  }
};
document.getElementById("alert-motion").onclick = function () {
  // feature detect
  if (typeof DeviceMotionEvent.requestPermission === "function") {
    DeviceMotionEvent.requestPermission()
      .then((permissionState) => {
        if (permissionState === "granted") {
          window.addEventListener("devicemotion", () => {});
        }
      })
      .catch(console.error);
  } else {
    // handle regular non iOS 13+ devices
  }
};

document.getElementById("alert-orientation").onclick = function () {
  // feature detect
  if (typeof DeviceOrientationEvent.requestPermission === "function") {
    DeviceOrientationEvent.requestPermission()
      .then((permissionState) => {
        if (permissionState === "granted") {
          window.addEventListener("deviceorientation", () => {});
        }
      })
      .catch(console.error);
  } else {
    // handle regular non iOS 13+ devices
  }
};
//document.getElementById("permission").click = function () {
//
//};
