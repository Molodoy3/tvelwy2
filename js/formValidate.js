//Универсальная обработка всех форм на сайте

//Необходимо указать имена форм и соответсвующих путей для fetch запроса
const urls = {
    "loginForm": "/account/login",
    "registerForm": "/account/register",
    "confirmationForm": "/account/confirmation",
    "recoveryForm": "/account/recovery",
    "editPasswordForm": window.location.pathname,
    "editProfileForm": window.location.pathname,
};


//Маска для телефона: data-mask-tel (для валидации по этой маске также указываем data-req  и data-req-tel)

//Для проверки полей в первую очередь надо указывать data-req (проверяет просто на пустоту) и дополнительные атрибуты:
// data-req-email - почта
// data-req-tel - почта
// data-req-login - логин
// data-req-password - пароль
// data-double-password - повторение пароля

//Для обязательных checkbox достаточно просто указать data-req
//Для обязательных выбранных select достаточно просто указать data-req

//и можно указать минимальную и максимальную длину для полей:
// data-req-min
// data-req-max

//Для вывода ошибок под элементами проверяемых полей можно указать data-text-error, который создаст <div class="error-element">текст ошибки</div>


function openPopup(popup, response) {
    popup.classList.add('open');

    //Заполнение попапа
    popup.querySelector(".title").innerText = response["title"];
    popup.querySelector(".popup__text").innerText = response["text"];
    const buttonPopup = popup.querySelector(".button");
    buttonPopup.innerText = response["textButton"];
    buttonPopup.href = response["linkButton"];

    //Устранение дергания при убирании скрола
    const lockPaddingValue = window.innerWidth - document.body.offsetWidth + 'px';
    document.body.style.paddingRight = lockPaddingValue;
    document.body.style.overflow = "hidden";
    const header = document.querySelector("header");
    if (header) {
        header.style.paddingRight = lockPaddingValue;
    }
}


const forms = document.forms;
if (forms.length) {
    let form = forms[0];
    //Проходим циклом по всем формам
    for (let index = 0; index < forms.length; index++) {

        const formName = form.name;

        //!Добавление превью загружаемой картинки
        if (formName === "editProfileForm") {
            const fileInput = form.querySelector("input[type='file']");
            let image;
            fileInput.addEventListener("change", e => {
                image = e.target.files[0];
                const imageUrl = URL.createObjectURL(image);
                form.querySelector(".account__image").innerHTML = `<img data-open-image src="${imageUrl}" alt="Фото профиля">`;
                form.querySelector(".account__add-image").innerText = "Изменить картинку";
            });
        }

        form = forms[index];
        const url = urls[formName];
        if (url) {
            form.addEventListener('submit', formSend);

            //!Телефонная маска для полей с типом tel
            //telephonMask(form);
        } else {
            console.log("FormValidate: для формы " + formName + " не задан url в объекте!!!");
        }
    }

    //Отправка формы
    async function formSend(e) {
        e.preventDefault();
        let errors = formValidate(form);
        if (errors === 0) {
            //!Отправка формы
            const url = urls[form.name];
            const formData = new FormData(form);

            fetch(url, {
                method: "POST",
                body: formData
            })
                .then(response => response.json())
                .then(response => {
                    const popup = document.querySelector("#popup");
                    if (popup) {
                        if (response["status"] === "success") {

                            openPopup(popup, response);

                            //очистка формы
                            form.reset();

                            //Блокировка кнопки
                            const button = document.querySelector("[data-block-after]");
                            if (button) {
                                button.style.cssText = "opacity: 0.5; pointer-events: none";
                                button.tagName = "a";
                                button.href = "/";
                                delete button.type;
                            }

                            e.preventDefault();
                        } else {
                            openPopup(popup, response);
                            e.preventDefault();
                        }
                    }
                })
                .catch(error => {
                    console.error(error);
                    alert('Ошибка отправки');
                });

            //удаление текстовых ошибок
            const errorElements = form.querySelectorAll('.error-element');
            if (errorElements.length) {
                errorElements.forEach(item => {
                    item.remove();
                });
            }
        } else {
            //?Ошибка
            form.classList.add('error');
        }
    }

    //Функция валидации формы
    function formValidate(form) {
        const errorElements = form.querySelectorAll('.error-element');
        if (errorElements.length) {
            errorElements.forEach(item => {
                item.remove();
            });
        }

        let errors = 0;
        const formReq = form.querySelectorAll('[data-req]');
        if (formReq.length) {
            for (let index = 0; index < formReq.length; index++) {
                const input = formReq[index];
                formRemoveError(input);
                let isMessageOutput = false;

                //добавить телефон, либо почта
                //Проверка почты
                if (input.hasAttribute("data-req-email")) {
                    if (emailTest(input)) {
                        formAddError(input);
                        errors++;
                        setTextError(input);
                        isMessageOutput = true;
                    }
                }
                //Проверка телефона (в соответсвии с маской)
                else if (input.hasAttribute("data-req-tel")) {
                    if (!telTest(input)) {
                        formAddError(input);
                        errors++;
                        if (!isMessageOutput) {
                            setTextError(input);
                            isMessageOutput = true;
                        }
                    }
                }
                //Проверка логина
                else if (input.hasAttribute("data-req-login")) {
                    if (!loginTest(input)) {
                        formAddError(input);
                        errors++;
                        if (!isMessageOutput) {
                            setTextError(input);
                            isMessageOutput = true;
                        }
                    }
                }
                //Проверка пароля
                else if (input.hasAttribute("data-req-password")) {
                    if (!passwordTest(input)) {
                        formAddError(input);
                        errors++;
                        if (!isMessageOutput) {
                            setTextError(input);
                            isMessageOutput = true;
                        }
                    }
                }
                //Проверка повторяюсегося пароля
                else if (input.hasAttribute("data-double-password")) {
                    if (!passwordDoubleTest(input)) {
                        formAddError(input);
                        errors++;
                        if (!isMessageOutput) {
                            setTextError(input);
                            isMessageOutput = true;
                        }
                    }
                }
                //Проверка выбранных checkbox
                else if (input.type === "checkbox" && input.checked === false) {
                    formAddError(input);
                    errors++;
                    if (!isMessageOutput) {
                        setTextError(input);
                        isMessageOutput = true;
                    }
                }
                //Проверка выбранных select
                else if (input.tagName == "SELECT") {
                    const selectedOption = input.options[input.selectedIndex];
                    if (!selectedOption || selectedOption.disabled) {
                        formAddError(input);
                        errors++;
                        if (!isMessageOutput) {
                            setTextError(input);
                            isMessageOutput = true;
                        }
                    }
                    continue; // тут переходим на следующую итерация цикла, даже если ошибки нет в select, так как следующая проверка на value всегда ошибку будет вызывать
                }
                //Проверка на пустоту
                else if (input.value === '') {
                    formAddError(input);
                    errors++;
                    isMessageOutput ? null : setTextError(input);
                    continue;
                }
           
                //Дополнительные проверка на минимальную и максимальную длину
                const minLength = input.dataset.reqMin;
                if (input.dataset.reqMin && input.value.length < minLength) {
                    formAddError(input);
                    errors++;
                    isMessageOutput ? null : setTextError(input);
                }
                const maxLength = input.dataset.reqMax;
                if (input.dataset.reqMax && input.value.length > maxLength) {
                    formAddError(input);
                    errors++;
                    isMessageOutput ? null : setTextError(input);
                }
            }

            //!Дополнительная проверка на наличие превью загруженной картинки
            /* const img = form.querySelector(".add-post__image").querySelector("img");
            if (!img) {
                const elem = form.querySelector("button.add-image");
                if (elem) {
                    formAddError(elem);
                    setTextError(input);
                }
                errors++;
            } */

            return (errors);
        }
    }




    //?Далее второстепенные функции

    //удаление классов error
    function formRemoveError(input) {
        input.classList.remove('error');
        input.parentElement.classList.remove('error');
    }
    //добавление классов error
    function formAddError(input) {
        input.classList.add('error');
        input.parentElement.classList.add('error');
    }
    //Добавление текстовой ошибки
    function setTextError(input) {
        if (input.dataset.textError) {
            const textError = input.dataset.textError;
            input.insertAdjacentHTML(
                'afterend',
                `<div class="error-element">${textError}</div>`
            )
        }
    }

    //Провека корректности почты
    function emailTest(input) {
        return !/^\w+([\.*]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,8})+$/.test(input.value);
    }
    //Логин: первые символы ток англ буквы прописные, либо капсом, остальные также, но еще можно цифры, _ и -
    function loginTest(input) {
        const regexForLogin = /^[a-zA-Z](.[a-zA-Z0-9_-]*)$/;
        return regexForLogin.test(input.value);
    }
    //Пароль: обязательное использование цифр, прописных и заглавных латинских букв, специальных символов
    function passwordTest(input) {
        const regexForPassword = /(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z!@#$%^&*]/g;
        return regexForPassword.test(input.value);
    }
    //Пароль: обязательное использование цифр, прописных и заглавных латинских букв, специальных символов
    function telTest(input) {
        const regexForTel = /\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}/;
        return regexForTel.test(input.value);
    }
    //проверка соотвествия поля и поля пароля
    function passwordDoubleTest(input) {
        const inputPassword = form.querySelector("input[type='password']");
        if (inputPassword && inputPassword.value === input.value) {
            return true;
        }
        return false;
    }
}


//Для маски телефона
function telephonMask(form) {
    const inputs = form.querySelectorAll("[data-mask-tel]");
    if (inputs.length) {
        inputs.forEach(input => {
            input.value = "+7 ";

            input.addEventListener("input", mask, false);
            input.addEventListener("focus", mask, false);
            input.addEventListener("blur", mask, false);
            input.addEventListener("keydown", mask, false);
        });
    }
}

function mask(event) {
    let keyCode;
    event.keyCode && (keyCode = event.keyCode);
    const pos = this.selectionStart;
    if (pos < 4) event.preventDefault();
    let matrix = "+7 (___) ___-__-__",
        i = 0,
        def = matrix.replace(/\D/g, ""),
        val = this.value.replace(/\D/g, ""),
        new_value = matrix.replace(/[_\d]/g, function (a) {
            return i < val.length ? val.charAt(i++) : a
        });
    i = new_value.indexOf("_");
    if (i != -1) {
        i < 5 && (i = 4);
        new_value = new_value.slice(0, i)
    }
    let reg = matrix.substr(0, this.value.length).replace(/_+/g,
        function (a) {
            return "\\\d{1," + a.length + "}"
        }).replace(/[+()]/g, "\\$&");
    reg = new RegExp("^" + reg + "$");
    if (!reg.test(this.value) || this.value.length < 6 || keyCode > 47 && keyCode < 58) {
        this.value = new_value;
    }
    if (event.type == "blur" && this.value.length < 6) {
        this.value = "+7 ";
    }
}

