export function apiGet(url, callback) {

    fetch(url, {
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        method: "GET"
    })
        .then((res) => res.json())
        .then(

            (result) => {

                callback(result);
            },

            (error) => {
                console.log("This is error", error);
            }
        );
}


export function apiPost(url, data, token, callback) {
    fetch(url, {
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "x-csrf-token": token,
        },
        method: "POST",
        body: JSON.stringify(data),
    })
        .then((res) => res.text())
        .then((res) => {
            if (res.indexOf("This site requires Javascript to work, please enable Javascript in your browser or use a browser with Javascript support") > 0) {
                window.location.reload();
                return;
            }
            return JSON.parse(res);
        })
        .then(

            (result) => {
                if (result.message == 'CSRF token mismatch.') {
                    window.location.reload();
                } else {
                    callback(result);
                }
            },

            (error) => {
                console.log("This is error", error);

            }
        );
}

export const scaleEffect = new function () {
    this.show = function (box) {

        box.style.transition = '';
        const boxRect = box.getBoundingClientRect();
        let top = ((window.innerHeight - boxRect.height) / 2) + window.scrollY;
        if (top < window.scrollY) {
            top = window.scrollY;
        }

        box.style.top = `${top}px`;
        box.style.left = `${(window.innerWidth - boxRect.width) / 2}px`;
        box.style.scale = 0.01;
        setTimeout(() => {
            box.style.visibility = 'visible';
            box.style.transition = 'scale 0.5s ease-out';
            box.style.scale = 1;
        }, 1);
    };

    this.hide = function (box, callback) {
        box.style.scale = 0;
        setTimeout(() => {
            callback();
        }, 500);
    }
}

export function isMobile() {
    return (window.innerHeight < 800 || window.innerWidth < 800);
}

export const myCaptcha = {
    param: '',
    randCode: '',
    create: function (id) {
        this.randCode = parseInt(Math.random() * 1000000);
        var c = document.getElementById(id);
        var ctx = c.getContext("2d");
        ctx.font = "50px Arial";
        ctx.fillText(this.randCode, 10, 50);
    },

    validate() {
        return (this.param == this.randCode);
    },

    set(e) {
        this.param = e.target.value;
    }
}