export default function Logo({ baseURL, connection }: any) {
  return (
    <svg
      onClick={() => {
        window.location.assign(baseURL);
      }}
      className="logo  cursor-pointer h-8 w-8 flex justify-items-start  items-start  self-center  "
      width="512"
      height="512"
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {connection ? (
        <rect width="512" height="476.07" rx="150" fill="#3ef994" />
      ) : (
        <rect width="512" height="476.07" rx="150" fill="#4F4F4F" />
      )}
      <rect
        opacity="0.8"
        x="17.3561"
        y="17.9648"
        width="477.288"
        height="440.14"
        rx="150"
        fill="#5F5F5F"
      />
      {connection ? (
        <rect y="35.9303" width="512" height="476.07" rx="150" fill="#3ef994" />
      ) : (
        <rect y="35.9303" width="512" height="476.07" rx="150" fill="#4F4F4F" />
      )}
      <path
        d="M168.102 396.904C167.123 397.456 165.906 396.599 166.505 395.781L261.874 265.688C262.232 265.199 263.068 265.084 263.591 265.452L323.87 307.88C324.394 308.248 324.335 308.91 323.75 309.239L168.102 396.904Z"
        fill="white"
      />
      <path
        d="M344.871 149.982C346.828 148.881 349.263 150.596 348.063 152.232L255.858 277.878C255.14 278.855 253.469 279.083 252.423 278.347L194.201 237.323C193.156 236.586 193.274 235.263 194.444 234.605L344.871 149.982Z"
        fill="white"
      />
    </svg>
  );
}

{
  /* <svg
  width="512"
  height="512"
  viewBox="0 0 512 512"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
></svg>; */
}
