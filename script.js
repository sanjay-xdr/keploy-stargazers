async function fetchStargazers() {
    const repoUrl = document.getElementById("repoUrl").value.trim();
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);

    if (!match) {
        alert("Invalid GitHub URL. Use format: https://github.com/user/repo");
        return;
    }

    const owner = match[1];
    const repo = match[2];
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/stargazers?per_page=100`;

    let stargazers = [];
    let page = 1;

    document.getElementById("loader").style.display = "block";
    document.getElementById("status").innerText = "";
    document.getElementById("stargazersList").innerHTML = "";

    try {
        while (true) {
            const response = await fetch(`${apiUrl}&page=${page}`, {
                headers: { "Accept": "application/vnd.github.v3+json" }
            });

            if (!response.ok) break;

            const data = await response.json();
            if (data.length === 0) break;

            stargazers = stargazers.concat(data);
            page++;
        }

        if (stargazers.length === 0) {
            alert("No stargazers found or repo not public.");
            document.getElementById("loader").style.display = "none";
            return;
        }

        displayStargazers(stargazers);
        generateCSV(stargazers);

        document.getElementById("status").innerText = "CSV file ready!";
    } catch (error) {
        alert("Error fetching data. Check the repo URL.");
        console.error(error);
    } finally {
        document.getElementById("loader").style.display = "none";
    }
}

function displayStargazers(users) {
    let list = document.getElementById("stargazersList");
    list.innerHTML = "";

    users.forEach(user => {
        let listItem = document.createElement("li");
        listItem.innerHTML = `<a href="${user.html_url}" target="_blank">${user.login}</a>`;
        list.appendChild(listItem);
    });
}

function generateCSV(users) {
    let csvContent = "Username,Profile URL\n";
    users.forEach(user => {
        csvContent += `${user.login},${user.html_url}\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "stargazers.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
