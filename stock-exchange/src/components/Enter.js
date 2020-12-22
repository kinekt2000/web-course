import React, {Component} from 'react';
import axios from 'axios'

/* import styles */
import "./styles/enter.css";
import Input from "./Input";

class Enter extends Component{

    constructor(props) {
        super(props);

        this.state = {
            message: "",
            username: ""
        }

        this.currentLoaction = new URL(window.location.href);


        /*BIND METHODS TO THIS*/
        this.keyPressed = this.keyPressed.bind(this);
        this.submit = this.submit.bind(this);
        this.changed = this.changed.bind(this);
        this.success = this.success.bind(this);
        this.handleError = this.handleError.bind(this);
        this.setMessage = this.setMessage.bind(this);
    }

    changed(event) {
        this.setState({username: event.target.value})
    }

    keyPressed(event) {
        if(event.key === "Enter") {
            event.preventDefault();
            this.submit();
        }
    }

    submit() {
        if(this.state.username) {
            axios.get("http://localhost:3030/login", {params: {username: this.state.username}})
                .then((response) => { this.success(response.data) })
                .catch(error => { this.handleError(error.response.status) })
        } else {
            this.handleError(undefined);
        }
    }

    success(link) {
        window.location.assign(`${link}`);
    }

    handleError(error_code) {
        switch (error_code) {
            case undefined:
                this.setMessage("Can't be empty");
                break;

            case 404:
                this.setMessage("This user doesn't exist");
                break;

            case 500:
                this.setMessage("Server database error");
                break;

            default:
                this.setMessage("Internal server error");
        }
    }

    setMessage(message) {
        this.setState({message})
    }

    render() {
        return(
            <div className="enter-wrapper">
                <div className="input-field">
                    <Input onChange={this.changed} onKeyPress={this.keyPressed} placeholder="USERNAME"/>
                    <small>{this.state.message}</small>
                </div>
                <button type="button" onClick={this.submit}>SUBMIT</button>
            </div>
        )
    }
}

export default Enter;
