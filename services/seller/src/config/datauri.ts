import DataUriParser from "datauri/parser.js";
import path from "path";

const getBuffer = (file: any) => {
  const parser = new DataUriParser();
  const fileExtention = path.extname(file.originalname).toString();

  return parser.format(fileExtention, file.buffer);
};

export default getBuffer;
