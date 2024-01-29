import LocalDDDDOCRAPI from "./api/ddddocr";

const api_url = "http://localhost:5000/api";
const token = "token";

class API {
    async runOCR(image:string):Promise<string>{return "";}
}

// Creates an API class
class RemoteAPI implements API{
    serverAddr: string;
    token: string;
    constructor(serverAddr: string, token: string) {
        this.serverAddr = serverAddr;
        this.token = token;
    }

    // Get the image from the API
    async runOCR(image: string): Promise<string> {
        const response = await fetch(this.serverAddr, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: "ocr",
                token: this.token,
                image: image,
            }),
        });

        // Deserialize the response
        try{
            const data = await response.json();
            if (data.status === "ok") {
                return data.result;
            } else {
                throw new Error(data);
            }
        } catch (error) {
            console.error('Error parsing response JSON:', error)
            return "";
        }
    }
}

// Creates a new API instance
// const api = new RemoteAPI(api_url, token);
const api = new LocalDDDDOCRAPI();

export {API, api};