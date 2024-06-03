import axios from 'axios';

const createCard = (i18nInstance, type) => {
    const box = document.createElement('div');
    box.classList.add('card', 'border-0');

    const body = document.createElement('div');
    body.classList.add('card-body');

    const cardTitle = document.createElement('h2');
    cardTitle.classList.add('card-title', 'h4');
    cardTitle.textContent = i18nInstance.t(type);
    body.append(cardTitle);

    const list = document.createElement('ul');
    list.classList.add('list-group', 'border-0', 'rounded-0');

    box.append(body);
    box.append(list);

    return box;
};

export const parseRSS = (data) => {
    const parser = new DOMParser();
    const parsedData = parser.parseFromString(data, 'application/xml');
    const items = parsedData.querySelectorAll('item');
    const posts = Array.from(items).map((item) => {
        return {
            title: item.querySelector('title').textContent,
            description: item.querySelector('description').textContent,
            link: item.querySelector('link').textContent,
        };
    });
    const title = parsedData.querySelector('title').textContent;
    const description = parsedData.querySelector('description').textContent;
    return { title, description, posts }
};

export const renderFeeds = (watchedState, elements, i18nInstance) => {
    elements.feeds.innerHTML = "";
    elements.posts.innerHTML = "";
    const feedsCard = createCard(i18nInstance, 'feeds');
    const postsCard = createCard(i18nInstance, 'posts');
    let feedId = 0;
    let postId = 0;

    watchedState.feeds.forEach((feed) => {
        const li = document.createElement('li');
        li.classList.add('list-group-item', 'border-0', 'border-end-0');
        li.setAttribute('id', feedId);
        const feedTitle = document.createElement('h3');
        feedTitle.classList.add('h6', 'm-0');
        feedTitle.textContent = feed.title;
        const feedDescription = document.createElement('p');
        feedDescription.classList.add('m-0', 'small', 'text-black-50');
        feedDescription.textContent = feed.description;
        li.append(feedTitle);
        li.append(feedDescription);
        feedsCard.querySelector('ul').append(li);

        feed.posts.forEach((post) => {
            const li = document.createElement('li');
            li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
            li.setAttribute('id', postId);
            postId += 1;
            li.setAttribute('for', feedId);

            const a = document.createElement('a');
            a.classList.add('fw-bold');
            a.setAttribute('href', post.link)
            a.setAttribute('target', '_blank')
            a.textContent = post.title;

            const button = document.createElement('button');
            button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
            button.textContent = i18nInstance.t('preview');

            li.append(a);
            li.append(button)
            postsCard.querySelector('ul').append(li);
        })
        feedId += 1;
    })

    elements.feeds.append(feedsCard);
    elements.posts.append(postsCard);
};

export default (url, watchedState, i18nInstance) => {
    axios
        .get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`)
        .then((response) => {
            if (response.data.status.http_code === 200) return parseRSS(response.data.contents);
            if (response.data.status.http_code === 404) throw new Error (404);
            throw new Error ('No response from server');
        })
        .then((parsedRSS) => {
            watchedState.feeds.unshift(parsedRSS);
        })
        .catch((err) =>  watchedState.error = err.message);
};
