import React from "react";
import { Form } from "react-bootstrap";
import intakeCSS from "/styles/intakeform.module.css";
import ExtraInput from "/components/form/ExtraInput";

export default function SelectLarge({ intakeform, initialSelectOption, name, choices, value, handleChange, label, width, height }) {
  const placeholder = `<option value="" selected disabled hidden>Choose here</option>`
    return (
        <Form.Group className={intakeCSS.selectCustom}>
            <div className={intakeCSS.selectLabelSelect}>
                <Form.Label style={{ margin: "auto 0px", color: "#0B3642", paddingRight: "1rem", width: "170px"}}>{label}</Form.Label>
                <Form.Select aria-label="Default select example" className="select" name={name} onChange={handleChange} value={value} style={{ height: "36px", maxWidth: `${width}`, width: "190px", borderRadius: "4px", margin: "0 1rem" }}>
                    {[
                        initialSelectOption,
                        placeholder,
                        ...choices?.map((choice, i) => (
                            <option value={i + 1} key={choice + i} name={name} style={{ height: "40px", margin: "5px"}}>
                                {choice}
                            </option>
                        )),
                    ]}
                </Form.Select>
            </div>
            {((intakeform?.[name]) == (name == 500 ? 5 : 11 )) ? <div className={intakeCSS.selectCustomExtraInput}><ExtraInput type={"text"} value={intakeform?.[parseInt(name) + 1]} name={parseInt(name) + 1} handleChange={handleChange} width={"410px"}/></div>: null}
        </Form.Group>
    );
}
