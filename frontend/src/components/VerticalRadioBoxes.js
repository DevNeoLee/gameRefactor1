import ToggleButton from "react-bootstrap/ToggleButton";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import intakeCSS from "/styles/intakeform.module.css";

export const VerticalRadioBoxes = ({ item, intakeform, handleChange, width }) => {
    return (
        <ButtonGroup  vertical={true} name={item?.id}>
            {item?.choices?.map((choice, idx) => (
                <ToggleButton
                    key={choice + idx}
                    id={choice + idx}
                    type="radio"
                    variant={"outline-secondary"}
                    name={item.id}
                    value={idx + 1}
                    checked={intakeform[item.id] == idx + 1}
                    onChange={(e) => handleChange(e, {type: "radio"})}
                    className={intakeCSS.radioButtonVertical}
                >
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
                      {choice}
                    </div>
                </ToggleButton>
            ))}
        </ButtonGroup>
    );
};
