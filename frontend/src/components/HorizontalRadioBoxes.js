import ToggleButton from "react-bootstrap/ToggleButton";
import intakeCSS from "/styles/intakeform.module.css";

export const HorizontalRadioBoxes = ({ item, intakeform, handleChange, height="100px"}) => {
    return (
        <div name={item.id} className={intakeCSS.horizontalRadioBoxes}>
            {item?.choices?.map((choice, idx) => (
                <ToggleButton
                    key={item + idx}
                    id={item.id + idx}
                    type="radio"
                    variant={"outline-secondary"}
                    name={item.id}
                    value={idx + 1}
                    checked={intakeform?.[item.id] == idx + 1}
                    onChange={(e) => handleChange(e, {type: "radio"})}
                    className={intakeCSS.radioButton}
                    style={{ height: `${height}`}}
                >
                    {" "}
                    <div
                        style={{
                            padding: "auto",
                            height: "100%",
                            display: "flex",
                            width: "100%",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                       <div style={{}}><div>{choice}</div><div style={{ fontSize: "0.7rem"}}>{item.choicesDetails?.[idx]}</div></div>
                    </div>
                </ToggleButton>
            ))}
        </div>
    );
};
