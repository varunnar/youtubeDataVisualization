import fetch from "node-fetch";

async function query(data) {
    const response = await fetch(
        "https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest",
        {
            method: "POST",
            headers: {
                Authorization: `Bearer `,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        }
    );
    const result = await response.json();
    return result;
}

query({inputs: "Today is a great day"}).then((response) => {
    console.log(JSON.stringify(response, null, 2));
})