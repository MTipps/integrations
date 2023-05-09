export interface GithubProps {
    content: string;
    url: string;
}

const splitGithubUrl = (url: string) => {
    const permalinkRegex =
        /^https?:\/\/github\.com\/([\w-]+)\/([\w-]+)\/blob\/([a-f0-9]+)\/(.+?)#(.+)$/;
    const wholeFileRegex = /^https?:\/\/github\.com\/([\w-]+)\/([\w-]+)\/blob\/([\w.-]+)\/(.+)$/;
    const multipleLineRegex = /^L\d+-L\d+$/;

    let orgName = '';
    let repoName = '';
    let ref = '';
    let fileName = '';
    let lines = [];

    if (url.match(permalinkRegex)) {
        const match = url.match(permalinkRegex);

        orgName = match[1];
        repoName = match[2];
        ref = match[3];
        fileName = match[4];
        const hash = match[5];

        if (hash !== '') {
            if (url.match(permalinkRegex)) {
                if (hash.match(multipleLineRegex)) {
                    lines = hash.replace(/L/g, '').split('-').map(Number);
                } else {
                    const singleLineNumberArray: number[] = [];
                    const parsedInt = parseInt(hash.replace(/L/g, ''), 10);
                    singleLineNumberArray.push(parsedInt);
                    singleLineNumberArray.push(parsedInt);
                    lines = singleLineNumberArray;
                }
            }
        }
    } else if (url.match(wholeFileRegex)) {
        const match = url.match(wholeFileRegex);

        orgName = match[1];
        repoName = match[2];
        ref = match[3];
        fileName = match[4];
    }
    return {
        orgName,
        repoName,
        fileName,
        ref,
        lines,
    };
};

const getLinesFromGithubFile = (content, lines) => {
    return content.slice(lines[0] - 1, lines[1]);
};

const fetchGithubFile = async (orgName, repoName, file, ref, lines) => {
    const baseURL = `https://api.github.com/repos/${orgName}/${repoName}/contents/${file}?ref=${ref}`;

    const headers = {
        'User-Agent': 'request',
        // Authorization: 'Bearer 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',
    };

    const res = await fetch(baseURL, { headers }).catch((err) => {
        throw new Error(`Error fetching content from ${baseURL}. ${err}`);
    });

    if (!res.ok) {
        return false;
        // throw new Error(`Response status from ${baseURL}: ${res.status}`);
    }

    const body = await res.text();
    return atob(JSON.parse(body).content);
};

const isUserLoggedIn = async () => {
    return await fetch('https://api.github.com/user', {
        method: 'GET',
        headers: {
            'User-Agent': 'request',
            Authorization: `Bearer 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`,
        },
    })
        .then((response) => {
            if (response.ok) {
                // console.log('User is logged in');
                return true;
                // User is logged in
                // Perform action to display the code
            } else {
                // console.log('User is not logged in');
                return false;
                // User is not logged in
                // Redirect to login page or display a login form
            }
        })
        .catch((error) => {
            console.error('Error in https://api.github.com/user', error);
            return false;
        });
};

export const getGithubContent = async (url: string) => {
    const urlObject = splitGithubUrl(url);

    const userLoggedIn = await isUserLoggedIn();
    let content: string | boolean = '';

    if (userLoggedIn) {
        content = await fetchGithubFile(
            urlObject.orgName,
            urlObject.repoName,
            urlObject.fileName,
            urlObject.ref,
            urlObject.lines
        );

        if (content) {
            if (urlObject.lines.length > 0) {
                const contentArray = content.split('\n');
                const splitContent = getLinesFromGithubFile(contentArray, urlObject.lines);

                return splitContent.join('\n');
            }
        }
    }
    return content;
};
