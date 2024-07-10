import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../@/components/ui/popover";

export default function Info() {
  return (
    <Popover>
      <PopoverTrigger className="text-white self-center  justify-self-end w-8 h-8   bg-[#4f4f4f] rounded-[10px] flex justify-center items-center">
        <svg
          width="21"
          height="21"
          viewBox="0 0 15 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7.49991 0.876892C3.84222 0.876892 0.877075 3.84204 0.877075 7.49972C0.877075 11.1574 3.84222 14.1226 7.49991 14.1226C11.1576 14.1226 14.1227 11.1574 14.1227 7.49972C14.1227 3.84204 11.1576 0.876892 7.49991 0.876892ZM1.82707 7.49972C1.82707 4.36671 4.36689 1.82689 7.49991 1.82689C10.6329 1.82689 13.1727 4.36671 13.1727 7.49972C13.1727 10.6327 10.6329 13.1726 7.49991 13.1726C4.36689 13.1726 1.82707 10.6327 1.82707 7.49972ZM8.24992 4.49999C8.24992 4.9142 7.91413 5.24999 7.49992 5.24999C7.08571 5.24999 6.74992 4.9142 6.74992 4.49999C6.74992 4.08577 7.08571 3.74999 7.49992 3.74999C7.91413 3.74999 8.24992 4.08577 8.24992 4.49999ZM6.00003 5.99999H6.50003H7.50003C7.77618 5.99999 8.00003 6.22384 8.00003 6.49999V9.99999H8.50003H9.00003V11H8.50003H7.50003H6.50003H6.00003V9.99999H6.50003H7.00003V6.99999H6.50003H6.00003V5.99999Z"
            fill="currentColor"
            fillRule="evenodd"
            clipRule="evenodd"
          ></path>
        </svg>
      </PopoverTrigger>
      <PopoverContent className=" bg-bg border border-[var(--gray)]  p-4  rounded-xl md:min-w-[30vw]  min-w-[70vw] break-words md:max-w-[40vw] max-w-[80vw] md:right-1 right-1 md:top-1 top-1  absolute z-[99]">
        <ul className=" text-xs  flex flex-col gap-2">
          <li className=" border-b border-[var(--gray)] ">
            {" "}
            🔍 <br /> &nbsp; Make sure the devices are in the same network
          </li>
          <li className=" border-b border-[var(--gray)] ">
            {" "}
            📂 <br /> &nbsp; Select the other device and then choose the files
            to send
          </li>
          <li className="font- semibold italic text-[var(--textgray)] text-[.7rem]">
            &nbsp;Found any bugs? <br /> &nbsp;Reach out{" "}
            <a
              href="https://amith.vercel.app"
              target="_blank"
              className="   cursor-pointer w-[100%]  text-center justify-self-end self-center    "
            >
              @amithjayapraban
            </a>
          </li>
        </ul>
      </PopoverContent>
    </Popover>
  );
}
