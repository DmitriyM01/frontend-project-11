import i18next from 'i18next';
import resources from '../locales/translation.js';
import render from './view.js';
import { parseRSS } from './rss.js';
import axios from 'axios';

const elements = {
    form: document.querySelector('form'),
    textInput: document.querySelector('#url-input'),
    feedback: document.querySelector('#feedback'),
    posts: document.querySelector('.posts'),
    feeds: document.querySelector('.feeds'),
    modal: document.querySelector('.modal'),
    modalTitle: document.querySelector('.modal-title'),
    modalBody: document.querySelector('.modal-body'),
    modalLink: document.querySelector('a.full-article'),
    modalBtnClose: document.querySelector('button[class="btn btn-secondary"]'),
    modalBtnCloseCross: document.querySelector('button[class="btn-close close"]'),
    textNodes: {
        title: document.querySelector('title'),
        heading: document.querySelector('h1[class="display-3 mb-0"]'),
        subheading: document.querySelector('p[class="lead"]'),
        RSSLink: document.querySelector('label[for="url-input"]'),
        add: document.querySelector('button[type="submit"]'),
        // modalClose: document.querySelector('button[data-bs-dismiss="modal"]'),
    },
};

export default async () => {
    const state = {
        value: '',
        error: '',
        language: 'ru',
        urls: [],
        feeds: [],
        posts: []
    };

    const checkRssUpdates = (watchedState, time) => {
        if (watchedState.feeds.length > 0) {
          Array.from(watchedState.urls)
            .map((url) => axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`)
            .then((response) => {
                const newPosts = parseRSS(response.data.contents, watchedState).posts;
                const postTitles = watchedState.posts.map((post) => post.title);
                const uniquePosts = newPosts.filter((newPost) => !postTitles.includes(newPost.title));
                uniquePosts.forEach((post) => {
                    watchedState.posts.push(post)
                })
             })
            .catch((e) => console.log(e)));
        }
        setTimeout(() => checkRssUpdates(watchedState, time), time);
    };
    
    const i18nInstance = i18next.createInstance({
        lng: state.language,
        resources,
    }, (err, t) => {
        if (err) return console.log('something went wrong loading', err);
        t('key');
    });
    
    const loadTranslation = () => {
        Object.keys(elements.textNodes)
        .forEach((element) => {
            elements.textNodes[element].textContent = i18nInstance.t(element);
        });
    };
    loadTranslation();
    
    const watchedState = render(state, elements, i18nInstance);

    elements.form.addEventListener('submit', (e) => {
        e.preventDefault();

        const data = new FormData(elements.form);
        // trim() ВОЗМОЖНО придется ...УДАЛИТЬ... перед автоматической проверкой по причине того, 
        // что ломается валидация пустого поля
        const url = data.get('url').trim();
        watchedState.value = url;

    });

    elements.modalBtnClose.addEventListener('click', () => {
        modal.classList.remove('show');
        modal.style = '';
        document.querySelector('div.modal-backdrop').remove()
    })

    elements.modalBtnCloseCross.addEventListener('click', () => {
        modal.classList.remove('show');
        modal.style = '';
        document.querySelector('div.modal-backdrop').remove()
    })

    document.body.addEventListener('click', (e) => {
        if (e.target === elements.modal) {
            modal.classList.remove('show');
            modal.style = '';
            document.querySelector('div.modal-backdrop').remove()
        }
    })

    checkRssUpdates(watchedState, 5000)
};
