
import { Form, FormLabel } from 'react-bootstrap';
import { useState, useEffect } from 'react';

export default function Radio({ value, label, name, inline, required, handleChange, checked }) {

  return (
            <Form.Check
                // inline={inline}
                label={label}
                name={name}
                value={value}
                onChange={handleChange}
                type="radio"
                id={label+name}
                // required= "required"
                checked={checked}
                // style={{ marginBottom: "1px",paddingTop: "1px"}}
            />
        )
  }
       
          