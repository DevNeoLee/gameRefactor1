
import { Form, FormLabel } from 'react-bootstrap';
import { useState, useEffect } from 'react';

export default function Checkbox({ value, label, name, inline, required, handleChangeCheckbox, checked }) {

    return (
        <Form.Check
            inline={inline}
            label={label}
            name={name}
            checked={checked}
            onChange={handleChangeCheckbox}
            type="checkbox"
            value={checked}
            id={label}
            // required="required"
            // checked={checked}
        />
    )
}

