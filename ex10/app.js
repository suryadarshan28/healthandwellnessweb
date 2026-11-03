const http = require('http');
const fs = require('fs');
const { MongoClient } = require('mongodb');

const url = 'mongodb://127.0.0.1:27017/';

const client = new MongoClient(url);


// Function to prevent HTML injection
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, function(char) {
        const entities = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        };

        return entities[char];
    });
}


// Connect to MongoDB
async function startServer() {

    try {

        await client.connect();

        console.log("Connected to MongoDB");


        const db = client.db("healthWellnessDB");

        const collection = db.collection("registrations");


        const server = http.createServer(function(req, res) {

            // Display Home Page
            if (req.url === '/' && req.method === 'GET') {

                res.writeHead(200, {
                    'Content-Type': 'text/html'
                });

                fs.createReadStream('./home.html').pipe(res);

            }


            // Handle Form Submission
            else if (req.url === '/server' && req.method === 'POST') {

                let rawData = '';

                req.on('data', function(data) {

                    rawData += data;

                });


                req.on('end', async function() {

                    try {

                        const inputData = new URLSearchParams(rawData);

                        const user = {

                            name: inputData.get('name'),

                            email: inputData.get('email'),

                            age: Number(inputData.get('age')),

                            mobile: inputData.get('mobile'),

                            gender: inputData.get('gender'),

                            state: inputData.get('state'),

                            goal: inputData.get('goal')

                        };


                        // Store details in MongoDB
                        await collection.insertOne(user);


                        // Display Submitted Details
                        res.writeHead(200, {
                            'Content-Type': 'text/html'
                        });

                        res.write(`
                            <html>
                            <head>
                                <title>Submitted Details</title>

                                <style>
                                    body {
                                        font-family: Arial;
                                        background-color: #f0f8f4;
                                        padding: 20px;
                                    }

                                    h1 {
                                        text-align: center;
                                        color: #24845a;
                                    }

                                    table {
                                        width: 70%;
                                        margin: 30px auto;
                                        border-collapse: collapse;
                                        background-color: white;
                                    }

                                    th, td {
                                        border: 1px solid #cccccc;
                                        padding: 12px;
                                        text-align: left;
                                    }

                                    th {
                                        color: #185c3b;
                                        width: 30%;
                                    }

                                    a {
                                        display: block;
                                        text-align: center;
                                        color: #24845a;
                                    }
                                </style>

                            </head>

                            <body>

                                <h1>User Submitted Details</h1>

                                <table>

                                    <tr>
                                        <th>Name</th>
                                        <td>${escapeHTML(user.name)}</td>
                                    </tr>

                                    <tr>
                                        <th>Email</th>
                                        <td>${escapeHTML(user.email)}</td>
                                    </tr>

                                    <tr>
                                        <th>Age</th>
                                        <td>${escapeHTML(user.age)}</td>
                                    </tr>

                                    <tr>
                                        <th>Mobile Number</th>
                                        <td>${escapeHTML(user.mobile)}</td>
                                    </tr>

                                    <tr>
                                        <th>Gender</th>
                                        <td>${escapeHTML(user.gender)}</td>
                                    </tr>

                                    <tr>
                                        <th>State</th>
                                        <td>${escapeHTML(user.state)}</td>
                                    </tr>

                                    <tr>
                                        <th>Wellness Goal</th>
                                        <td>${escapeHTML(user.goal)}</td>
                                    </tr>

                                </table>

                                <a href="/">Back to Registration</a>

                            </body>
                            </html>
                        `);

                        res.end();

                        console.log("Registration saved successfully");

                    }

                    catch(error) {

                        console.log(error);

                        res.writeHead(500, {
                            'Content-Type': 'text/plain'
                        });

                        res.end("Error saving registration details.");

                    }

                });

            }

            else {

                res.writeHead(404);

                res.end("Page Not Found");

            }

        });


        server.listen(3000, function() {

            console.log("Server running at http://localhost:3000");

        });

    }

    catch(error) {

        console.log("MongoDB connection failed:", error);

    }

}


startServer();
