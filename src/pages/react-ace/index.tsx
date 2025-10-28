import React from "react";
import { CustomAceEditor } from "./components/index";
const Index = () => {
  return (
    <div>
      <CustomAceEditor
        value=""
        readOnly={false}
        height="20vh"
        mode="sql"
        tableColumns={[{ label: "kk", value: "kkk" }]}
      ></CustomAceEditor>
    </div>
  );
};

export default Index;
