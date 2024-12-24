import React, { useEffect, useRef, useState } from "react";
import data from "../data/PeriodicTable.json";

function UI({ setType, type }: { setType: Function; type: Number }) {
  function handleChange(event: any) {
    if (inputRef.current === null || inputRef.current["value"] === null) return;
    if (!data.elements[Number(inputRef.current["value"]) - 1]) return;
    setType(inputRef.current["value"]);
    setName(data.elements[Number(inputRef.current["value"]) - 1].name);
    setDescription(
      data.elements[Number(inputRef.current["value"]) - 1].summary
    );
    document.title =
      "Particle Viewer | " +
      data.elements[Number(inputRef.current["value"]) - 1].name;
  }

  const inputRef = useRef(null);

  const [name, setName] = useState<string>("Ununennium");
  const [description, setDescription] = useState<string>(
    "Ununennium, also known as eka-francium or simply element 119, is the hypothetical chemical element with symbol Uue and atomic number 119. Ununennium and Uue are the temporary systematic IUPAC name and symbol respectively, until a permanent name is decided upon. In the periodic table of the elements, it is expected to be an s-block element, an alkali metal, and the first element in the eighth period."
  );

  return (
    <div className="absolute flex justify-center w-[100vw] h-[50px]">
      <input
        type="number"
        placeholder="Protons"
        className="text-white w-20 h-8 bg-gray-800 mr-5 pl-2 rounded-sm mt-2"
        onChange={handleChange}
        ref={inputRef}
      />
      <div>
        <p className="text-2xl w-20 mt-2">{name}</p>
      </div>
      <div className="absolute left-0 top-14 lg:top-5 pl-5 w-[500px] pr-[50px] select-none flex gap-2">
        <div className="flex items-center w-[150px]">
          <div className="w-[30px] h-[30px] bg-[rgb(255,0,0)] mr-2" /> Proton
        </div>
        <div className="flex items-center w-[150px]">
          <div className="w-[30px] h-[30px] bg-[rgb(0,0,255)] mr-2" /> Electron
        </div>
        <div className="flex items-center w-[150px]">
          <div className="w-[30px] h-[30px] bg-[rgb(0,255,0)] mr-2" /> Neutron
        </div>
      </div>
      <div className="absolute right-0 top-5 w-[500px] pr-[50px] select-none invisible lg:visible">
        <p className="text-center">{name}</p>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default UI;
