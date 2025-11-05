import { useState, useEffect, useRef } from "react";
import { listData } from "./mock";

const LongList = ({ totalItems = 1000 }) => {
  return (
    <div className="long-list">
      <div className="list-container">
        {listData.map((item) => (
          <div key={item.id} className="list-item">
            {item.content}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LongList;
