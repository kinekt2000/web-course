import React from "react"

import "./styles/input.css"

function Input(props) {

    const placeholder = props.placeholder;

    return(
        <div className="input-container">
            <input {...props}/>
            <label>{placeholder}</label>
        </div>
    )
}

export default Input
