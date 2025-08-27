import React from "react";
import { Form } from "react-bootstrap";
import intakeCSS from "/styles/intakeform.module.css";

export default function SelectCustomSmall({ intakeform, _question, initialSelectOption, name, choices, value, handleChange, label, width, height }) {
  const placeholder = `<option value="" selected disabled hidden>Choose here</option>`
    return (
        <Form.Group className={intakeCSS.selectCustom} style={{ display: "flex", width: "100%", justifyContent: "space-between"}}>
            <Form.Label style={{ margin: "auto 0px", color: "#0B3642", paddingRight: "1rem", width: "114px"}}>{label}</Form.Label>
            <Form.Select aria-label="Default select example" className="select" name={name} onChange={handleChange} value={value}  style={{ height: "40px", maxWidth: `${width}`, width: `${width}`, borderRadius: "4px" }}>
                {[
                    initialSelectOption,
                    placeholder,
                    ...choices?.map((choice, i) => (
                        <option value={i + 1} key={choice + i} name={name}>
                            {choice}
                        </option>
                    )),
                ]}
            </Form.Select>
        </Form.Group>
    );
}
