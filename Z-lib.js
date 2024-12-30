$(document).ready(function() {
    const supportEmail = 'support@z-lib.do';
    const domains = {
        staticList: [
            'https://singlelogin.re',
            'https://z-library.rs',
            'https://z-library.do',
            'https://z-lib.do',
            'https://z-lib.fm',
            'https://z-lib.gs',
            'https://z-library.sk',
            'https://z-lib.gd',
            'https://z-lib.gl',
            'https://z-lib.su',
            'https://intl.su',
            'https://z-lib.bz',
            'https://z-lib.fo',
            'https://1lib.sk',
            'https://cnlib.icu',
            'https://z-lib.rest',
            'https://articles.sk'
        ],
        getAll: () => {
            return Array.from(domains.staticList);
        }
    };

    const domainsChecker = {
        stop: false,
        checkDomainTimeout: 15, 
        checkInParts: 5,
        checkInPartsDelay: 7, 
        processes: {
            list: {},
            add: (domain) => {
                domainsChecker.processes.list[domain] = 'start';
            },
            setAsCompleted: (domain) => {
                if (domainsChecker.processes.list[domain]) {
                    domainsChecker.processes.list[domain] = 'completed';
                }
            },
            clear: () => {
                domainsChecker.processes.list = {};
            },
            isEmpty: () => {
                return !Object.values(domainsChecker.processes.list).includes('start');
            }
        },
        results: {
            availableDomain: null,
        },
        run: (callback) => {
            if (domainsChecker.stop) {
                return;
            }

            domainsChecker.processes.clear();
            let domainsOriginal = domains.getAll();
            for (let domain of domainsOriginal) {
                domainsChecker.processes.add(domain);
            }

            let domainsPart;
            let counter = 0;
            while (domainsPart = domainsOriginal.splice(0, domainsChecker.checkInParts)) {
                if (!domainsPart.length) break;
                setTimeout((list) => {
                    list.forEach(domain => {
                        domainsChecker.checkDomain(domain, (isAvailable) => {
                            if (domainsChecker.stop) return;
                            if (!isAvailable && domainsChecker.processes.isEmpty()) {
                                callback(domainsChecker.results);
                            }
                            if (isAvailable && !domainsChecker.results.availableDomain) {
                                domainsChecker.stop = true;
                                domainsChecker.results.availableDomain = domain;
                                callback(domainsChecker.results);
                            }
                        });
                    });
                }, counter * domainsChecker.checkInPartsDelay * 1000, Array.from(domainsPart));
                counter += 1;
            }
        },
        checkDomain: (domain, callback) => {
            if (domainsChecker.stop) return;
            let url = domain + '/p/index.php?v=' + new Date().getTime();
            $.ajax({
                url: url,
                timeout: domainsChecker.checkDomainTimeout * 1000,
                crossDomain: true,
            }).done((data, g, resp) => {
                domainsChecker.processes.setAsCompleted(domain);
                callback((resp.status === 200 && resp.responseText.length > 0));
            }).fail(() => {
                domainsChecker.processes.setAsCompleted(domain);
                callback(false);
            });
        },
        processResult: (result) => {
            const availableDomain = domainsChecker.results.availableDomain;
            if (availableDomain) {
                window.location.href = availableDomain; 
            } else {
                $('#status').text("找不到可用域，点击按钮重试或联系我们: " + supportEmail);
                $('#checkDomainsBtn').show(); 
                $('#loader').hide(); 
            }
        }
    };

    $('#status').text("加载中... 请稍等");
    domainsChecker.run(domainsChecker.processResult);

    $('#checkDomainsBtn').click(function() {
        $('#status').text("加载中... 请稍等");
        $('#loader').show();
        $(this).hide();
        domainsChecker.run(domainsChecker.processResult);
    });

    $('#checkDomainsBtn').hide();
});
