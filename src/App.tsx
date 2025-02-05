import { useEffect, useRef, useState } from "react";
import "./App.css";
import { generateUsername } from "unique-username-generator";
import Info from "./components/Info";
import Logo from "./components/Logo";
import { getDeviceType } from "./utils/getDeviceType";
import Progress from "./components/Progress";
import { Analytics } from "@vercel/analytics/react";
// import ToggleTheme from "./components/ToggleTheme";

function App() {
  const [myname, setmyName] = useState("");
  const [destination, setDestination] = useState("");
  const [peers, setPeers] = useState<string[]>([]);
  const [connection, setConnection] = useState(false);
  const [recieverDeviceType, setRecieverDeviceType] = useState("");
  const production = true;
  var name = useRef("");
  const baseURL = production
    ? `https://${window.location.hostname}`
    : "http://192.168.18.27:3003";
  const wsURL = production
    ? "wss://ip2p-amithjayapraban.koyeb.app"
    : "ws://localhost:8080";
  var configuration = {
    iceServers: [
      {
        urls: "stun:stun.l.google.com:19302",
      },
    ],
  };

  useEffect(() => {
    name.current = generateUsername("", 0, 8);
    setmyName(name.current);
    let body: any = document.querySelector("body");

    openSignaling();
    // if (localStorage.getItem("theme")) {
    //   let theme = localStorage.getItem("theme");
    //   body.setAttribute("data-theme", theme);
    // } else if (window.matchMedia) {
    //   if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    //     body.setAttribute("data-theme", "dark");
    //     localStorage.setItem("theme", "dark");
    //   } else {
    //     body.setAttribute("data-theme", "light");
    //     localStorage.setItem("theme", "light");
    //   }
    // }
    body.setAttribute("data-theme", "dark");
    const themeColor: any = document.querySelector('meta[name="theme-color"]');
    let mode = body.getAttribute("data-theme");
    const color = mode == "dark" ? "#121212" : "#fafafa";
    themeColor.setAttribute("content", color);
    window.document.title = "iP2P";
  }, []);

  var ws: any = useRef();
  var peerConnection = useRef(new RTCPeerConnection(configuration));
  function openSignaling() {
    let device = getDeviceType();
    const url = `${wsURL}/${name.current}/${device}`;
    ws.current = new WebSocket(url);
    ws.current.onopen = () => console.log("WebSocket Open");
    ws.current.onerror = () => console.error("WebSocket Error");
    ws.current.onclose = () => console.error("WebSocket Disconnected");
    ws.current.onmessage = (e: any) => {
      if (typeof e.data != "string") return;
      const message = JSON.parse(e.data);

      const { id, type } = message;

      if (type === "peers") {
        console.log(message);
        setPeers(
          message.keys.filter((key: string) => {
            return key.split("%")[0] !== name.current;
          })
        );
      }

      switch (type) {
        case "offer":
          {
            peerConnection.current.setRemoteDescription({
              sdp: message.description,
              type: message.type,
            });
            const a = async () => {
              const answer = await peerConnection.current.createAnswer();
              await peerConnection.current.setLocalDescription(answer);
              setDestination(id);
              console.log(id, "id");
              ws.current.send(
                JSON.stringify({
                  id,
                  type: "answer",
                  description: answer.sdp,
                })
              );
            };
            a();
          }
          break;
        case "answer":
          peerConnection.current.setRemoteDescription({
            sdp: message.description,
            type: message.type,
          });
          break;

        case "candidate":
          peerConnection.current.addIceCandidate({
            candidate: message.candidate,
            sdpMid: message.mid,
          });
          break;
      }
    };
  }

  const dataChannel = peerConnection.current.createDataChannel("mydata");
  dataChannel.bufferedAmountLowThreshold = 1024 * 800;

  peerConnection.current.onicecandidate = async (e) => {
    // console.log(e, "once");

    if (e.candidate) {
      const { candidate, sdpMid } = e.candidate;
      ws.current.send(
        JSON.stringify({
          id: destination,
          type: "candidate",
          candidate,
          mid: sdpMid,
        })
      );
    }
  };

  peerConnection.current.addEventListener("connectionstatechange", (event) => {
    if (
      peerConnection.current.connectionState === "disconnected" ||
      peerConnection.current.connectionState === "failed"
    ) {
      setConnection(false);
      window.document.title = "iP2P / Disconnected";
      console.error(peerConnection.current.connectionState);
    }

    if (peerConnection.current.connectionState === "connected") {
      setConnection(true);
      window.document.title = "iP2P / Connected ";
      console.log("WS", peerConnection.current.connectionState);
    }
  });

  async function offerPeerConnection(id: string) {
    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);

    ws.current.send(
      JSON.stringify({
        id: `${id}`,
        type: "offer",
        description: offer.sdp,
      })
    );
  }

  let files: any = [];
  var prog: any = document.getElementById("progress");
  const fileAdd = (e: any) => {
    e.preventDefault();
    files = [...e.target.files];
    prog.style.width = `0%`;

    Sendmsg(e);
  };

  const Sendmsg = (e: any) => {
    e.preventDefault();
    send(files.shift());
    prog.classList.remove("w-0");

    dataChannel.addEventListener("message", (event) => {
      if (event.data == "next_file") {
        var prog: any = document.getElementById("progress");
        prog.style.width = "0";
        files.length > 0 && send(files.shift());
        files.length > 0 && console.log(files[0]);
      }
    });
  };

  let chunkSize = 64000; // 64 KB
  console.log(recieverDeviceType);

  let offset = useRef(0);

  let file: any = useRef(null);

  const send = (f: any) => {
    console.log(f, "file");
    file.current = f;
    offset.current = 0;
    dataChannel.send(`len%${f.size}`);
    dataChannel.send(`type:${file.current.name}`);
    emit(file.current);
  };

  async function emit(file: any) {
    let bufferSize = ["iPhone", "Android"].includes(recieverDeviceType)
      ? 1024 * 1024 * 4
      : 1024 * 1024 * 4;
    var prog: any = document.getElementById("progress");
    const percentage: any = document.getElementById("percentage");
    prog.style.opacity = "1";
    while (offset.current < file.size) {
      while (dataChannel.bufferedAmount > bufferSize) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }

      const chunk = file.slice(offset.current, offset.current + chunkSize);
      const reader = new FileReader();
      const arrayBuffer: ArrayBuffer = await new Promise((resolve) => {
        reader.onload = function (event) {
          resolve(event.target?.result as ArrayBuffer);
        };
        reader.readAsArrayBuffer(chunk);
      });
      dataChannel.send(arrayBuffer);
      prog.style.width = `${Math.abs(offset.current / file.size) * 100}%`;

      percentage.textContent = `${(
        Math.abs(offset.current / file.size) * 100
      ).toFixed(2)}%`;
      console.log(prog.style.width, "%%%");
      offset.current += chunkSize;
    }
    dataChannel.send("completed");
    percentage.textContent = `100%`;
    let name: any = document.querySelector(".toast");
    name.innerHTML = "File Sent";
    document.querySelector(".toast")?.classList.toggle("completed_animation");
    setTimeout(() => {
      percentage.textContent = ``;
      prog.classList.add("w-0");
      prog.style.width = `0%`;
    }, 1000);
    setTimeout(() => {
      document.querySelector(".toast")?.classList.toggle("completed_animation");
    }, 2000);
  }
  var type = useRef("");
  peerConnection.current.ondatachannel = (e: any) => {
    let fileChunks: any = [];
    let blobUrl: any;
    let file;
    let total_chunks: number,
      iterator: number = 0;
    let clientDc: any = e.channel;

    const messageHandler = (e: any) => {
      const percentage: any = document.getElementById("percentage");
      const prog: any = document.getElementById("progress");
      prog.classList.remove("w-0");
      if (e.data.toString()) {
        if (e.data.toString().includes("len")) {
          total_chunks = e.data.toString().split("%")[1];
        }
        if (e.data.toString().includes("type:")) {
          console.log(e.data, "type");
          type.current = e.data.toString();
        }
      }

      if (e.data.toString() === "completed") {
        percentage.textContent = `100%`;
        [iterator, total_chunks] = [0, 0];
        console.log("completed on client");
        file = new Blob(fileChunks);
        let t = type.current;
        blobUrl = URL.createObjectURL(file);
        let link = document.createElement("a");
        link.href = blobUrl;
        link.download = t.substring(5);
        document.body.appendChild(link);
        link.dispatchEvent(
          new MouseEvent("click", {
            bubbles: true,
            cancelable: true,
            view: window,
          })
        );
        let name: any = document.querySelector(".toast");
        name.innerHTML = "File recieved";
        document
          .querySelector(".toast")
          ?.classList.toggle("completed_animation");

        setTimeout(() => {
          URL.revokeObjectURL(blobUrl);
          file = null;
          blobUrl = null;
          fileChunks.length = 0;
          document.body.removeChild(link);
          type.current = "";
          clientDc.send("next_file");
          prog.classList.add("w-0");
          prog.style.width = `0%`;
          percentage.textContent = ``;
        }, 1000);
        setTimeout(() => {
          document
            .querySelector(".toast")
            ?.classList.toggle("completed_animation");
        }, 2000);
      }
      if (
        e.data.toString() !== "completed" &&
        !e.data.toString().includes("type") &&
        e.data.toString() !== `undefined` &&
        !e.data.toString().includes("len")
      ) {
        iterator += 64000;
        console.log(e.data, "chunks");
        prog.style.width = `${Math.abs(iterator / total_chunks) * 100}%`;

        percentage.textContent = `${(
          Math.abs(iterator / total_chunks) * 100
        ).toFixed(2)}%`;
        // clientDc.send("send_next_partition");
        fileChunks.push(e.data);
      }
    };

    clientDc.addEventListener("message", messageHandler);
  };

  return (
    <div className="flex flex-col  shadow-sm  app relative text-textc  h-[100dvh] ">
      <Analytics />
      <div className="text-white  bg-bg border border-[var(--gray)]   toast completed_animation absolute top-6   right-[25%] left-[25%]  flex items-center justify-center   rounded-[10px]    p-2 z-[66] text-xs ">
        File Sent
      </div>

      <section className="flex items-center p-6 justify-between w-full ">
        <Logo baseURL={baseURL} connection={connection} />
        <div className="flex items-center md:gap-8 gap-6">
          {/* <ToggleTheme /> */}
          <Info />
        </div>
      </section>

      <span
        id="progress"
        className="bg-g w-0 absolute  progress h-1 top-0"
      ></span>

      {!connection ? (
        <section className=" h-full overflow-y-auto self-center w-full md:w-[max-content] md:max-w-[80%]  flex justify-center items-center bg- [rgba(250,250,250,.1)] flex-wrap  transition text-white      ">
          {peers.map((i: any, n) => (
            <button
              key={i}
              onClick={() => {
                setRecieverDeviceType(i.split("%")[1]);
                offerPeerConnection(i);
                setDestination(i);
              }}
              className={`bg- [var(--gray)] px-1 m-4 text-textc w-20 h-20  md:w-24 md:h-24 rounded-full text-xs  text-b py-1`}
            >
              <img
                height={128}
                width={128}
                src={`/${i.split("%")[1]}.svg`}
                alt={`${i.split("%")[1]}`}
              />
              {i.split("%").map((ele: string, n: any) => (
                <p
                  key={ele}
                  className={`${
                    n == 1 ? `text-gray-500 text-[.6rem]` : `text-textc`
                  }`}
                >
                  {n == 0
                    ? ele.slice(0, 1).toLocaleUpperCase() + ele.slice(1)
                    : ele}
                </p>
              ))}
            </button>
          ))}
        </section>
      ) : (
        <section className=" h-full relative self-center w-full md:w-1/2   transition-[1] flex items-center justify-center  flex-col  text-xs text-white  gap-1  ">
          <Progress />
          <label
            className={` bor der  border-[var(--gray)] px-1 flex flex-col items-center justify-center  w-28 h-28 cursor-pointer  rounded-full text-xs  `}
          >
            {" "}
            <img
              height={128}
              width={128}
              src={`/${destination.split("%")[1]}.svg`}
              alt={`${destination.split("%")[1]}`}
            />
            <input
              type="file"
              multiple
              onChange={(e: any) => fileAdd(e)}
              className={``}
            />
          </label>
          <span className="flex justify-center flex-col items-center">
            {destination.split("%").map((ele: string, n: any) => (
              <p
                key={ele}
                className={`${
                  n == 1 ? `text-gray-400 text-[.6rem]` : `text-textc`
                }`}
              >
                {n == 0
                  ? ele.slice(0, 1).toLocaleUpperCase() + ele.slice(1)
                  : ele}
              </p>
            ))}
          </span>
        </section>
      )}

      <div className=" w-full flex flex-col gap-6  mb-5 mt-10 justify-center items-center ">
        <span className=" pulsing rounded-full "></span>
        <span className="text-xs flex flex-col justify-center items-center ">
          <span className="text-[var(--textgray)] text-[.6rem] italic">
            You are known as{" "}
          </span>
          {myname.slice(0, 1).toLocaleUpperCase() + myname.slice(1)}
        </span>
      </div>
    </div>
  );
}

export default App;
