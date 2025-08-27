
import { Form } from "react-bootstrap";

export default function Input ({ handleSubmit, autoFocus, label, name, onChange, required, type, placeholder, value }) {
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    }

    return (
    <Form.Group className="mb-3">
        <Form.Label>{label}</Form.Label>
        <Form.Control
            type={type}
            onChange={onChange}
            placeholder={placeholder}
            id={name}
            value={value}
            name={name}
            required={required}
            autoFocus={autoFocus}
            onKeyDown={handleKeyDown}
        />
    </Form.Group>
    )
}

