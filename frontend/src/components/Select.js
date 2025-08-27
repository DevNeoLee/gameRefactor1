import React from 'react'
import { Form } from 'react-bootstrap'

export default function Select({ question, name, choices, value, handleChange }) {
  return (
      <Form.Select aria-label="Default select example" className="select" name={name} onChange={handleChange} value={value}>
          <option>{question}</option>
          {choices.map((choice, i)=>(
              <option 
                    value={i + 1} 
                    key={choice + i} 
                    name={name}
                >{choice}</option>
          ))}
      </Form.Select>
  )
}
