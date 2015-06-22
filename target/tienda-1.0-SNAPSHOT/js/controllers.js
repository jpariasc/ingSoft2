/**
 * 
 */

'use strict';

/**
 * The root tiendaApp module.
 *
 * @type {tiendaApp|*|{}}
 */
var tiendaApp = tiendaApp || {};

/**
 * @ngdoc module
 * @name tiendaControllers
 *
 * @description
 * Angular module for controllers.
 *
 */
tiendaApp.controllers = angular.module('tiendaControllers', ['ui.bootstrap']);

/**
 * @ngdoc controller
 * @name MyProfileCtrl
 *
 * @description
 * A controller used for the My Profile page.
 */
tiendaApp.controllers.controller('MyProfileCtrl',
    function ($scope, $log, oauth2Provider, HTTP_ERRORS) {
        $scope.submitted = false;
        $scope.loading = false;

        /**
         * The initial profile retrieved from the server to know the dirty state.
         * @type {{}}
         */
        $scope.initialProfile = {};

        /**
         * Candidates for the teeShirtSize select box.
         * @type {string[]}
         */
        /*$scope.teeShirtSizes = [
            'XS',
            'S',
            'M',
            'L',
            'XL',
            'XXL',
            'XXXL'
        ];*/

        /**
         * Initializes the My profile page.
         * Update the profile if the user's profile has been stored.
         */
        $scope.init = function () {
            var retrieveProfileCallback = function () {
                $scope.profile = {};
                $scope.loading = true;
                //gapi.client.conference.getProfile().
                gapi.client.tienda.getProfile().
                    execute(function (resp) {
                        $scope.$apply(function () {
                            $scope.loading = false;
                            if (resp.error) {
                                // Failed to get a user profile.
                            } else {
                                // Succeeded to get the user profile.
                                $scope.profile.displayName = resp.result.displayName;
                                //$scope.profile.teeShirtSize = resp.result.teeShirtSize;
                                $scope.initialProfile = resp.result;
                            }
                        });
                    }
                );
            };
            if (!oauth2Provider.signedIn) {
                var modalInstance = oauth2Provider.showLoginModal();
                modalInstance.result.then(retrieveProfileCallback);
            } else {
                retrieveProfileCallback();
            }
        };

        /**
         * Invokes the conference.saveProfile API.
         *
         */
        // OJO OJO CONFERENCE =  TIENDA ???
        $scope.saveProfile = function () {
            $scope.submitted = true;
            $scope.loading = true;
            gapi.client./*conference*/tienda.saveProfile($scope.profile).
                execute(function (resp) {
                    $scope.$apply(function () {
                        $scope.loading = false;
                        if (resp.error) {
                            // The request has failed.
                            var errorMessage = resp.error.message || '';
                            $scope.messages = 'Failed to update a profile : ' + errorMessage;
                            $scope.alertStatus = 'warning';
                            $log.error($scope.messages + 'Profile : ' + JSON.stringify($scope.profile));

                            if (resp.code && resp.code == HTTP_ERRORS.UNAUTHORIZED) {
                                oauth2Provider.showLoginModal();
                                return;
                            }
                        } else {
                            // The request has succeeded.
                            $scope.messages = 'The profile has been updated';
                            $scope.alertStatus = 'success';
                            $scope.submitted = false;
                            $scope.initialProfile = {
                                displayName: $scope.profile.displayName
                                //,teeShirtSize: $scope.profile.teeShirtSize
                            };

                            $log.info($scope.messages + JSON.stringify(resp.result));
                        }
                    });
                });
        };
    })
;

/**
 * @ngdoc controller
 * @name CreateProductCtrl
 *
 * @description
 * A controller used for the Create conferences page.
 */
tiendaApp.controllers.controller('CreateProductCtrl',
    function ($scope, $log, oauth2Provider, HTTP_ERRORS) {

        /**
         * The conference object being edited in the page.
         * @type {{}|*}
         */
        $scope.producto = $scope.producto || {};

        /**
         * Holds the default values for the input candidates for city select.
         * @type {string[]}
         */
        /*$scope.cities = [
            'Chicago',
            'London',
            'Paris',
            'San Francisco',
            'Tokyo'
        ];*/

        /**
         * Holds the default values for the input candidates for topics select.
         * @type {string[]}
         */
        $scope.topics = [
            'Libros',
            'Calculadoras',
            'MicroProcesadores',
            'Computadores',
            'Celulares'
        ];

        /**
         * Tests if the arugment is an integer and not negative.
         * @returns {boolean} true if the argument is an integer, false otherwise.
         */
        $scope.isValidMaxAttendees = function () {
            if (!$scope.producto.amount || $scope.producto.amount.length == 0) {
                return true;
            }
            return /^[\d]+$/.test($scope.producto.amount) && $scope.producto.amount >= 0;
        }

        /**
         * Tests if the conference.startDate and conference.endDate are valid.
         * @returns {boolean} true if the dates are valid, false otherwise.
         */
        $scope.isValidDates = function () {
            if (!$scope.producto.startDate && !$scope.producto.endDate) {
                return true;
            }
            if ($scope.producto.startDate && !$scope.producto.endDate) {
                return true;
            }
            return $scope.producto.startDate <= $scope.producto.endDate;
        }

        /**
         * Tests if $scope.conference is valid.
         * @param conferenceForm the form object from the create_conferences.html page.
         * @returns {boolean|*} true if valid, false otherwise.
         */
        // OJOJOJOJO CON ESTE ATRIBUTO
        $scope.isValidProduct = function (productoForm) {
            return !productoForm.$invalid &&
                $scope.isValidMaxAttendees() 
                //&& $scope.isValidDates();
        }

        /**
         * Invokes the conference.createConference API.
         *
         * @param conferenceForm the form object.
         */
        //arreglar las funciones
        $scope.createProduct = function (productoForm) {
            if (!$scope.isValidProduct(productoForm)) {
                return;
            }

            $scope.loading = true;
            //ojo con esto gapi.client.conference.createConference
            gapi.client.tienda.createProduct($scope.producto).
                execute(function (resp) {
                    $scope.$apply(function () {
                        $scope.loading = false;
                        if (resp.error) {
                            // The request has failed.
                            var errorMessage = resp.error.message || '';
                            $scope.messages = 'Failed to create a product : ' + errorMessage;
                            $scope.alertStatus = 'warning';
                            $log.error($scope.messages + ' Product : ' + JSON.stringify($scope.producto));

                            if (resp.code && resp.code == HTTP_ERRORS.UNAUTHORIZED) {
                                oauth2Provider.showLoginModal();
                                return;
                            }
                        } else {
                            // The request has succeeded.
                            $scope.messages = 'The product has been created : ' + resp.result.name;
                            $scope.alertStatus = 'success';
                            $scope.submitted = false;
                            $scope.producto = {};
                            $log.info($scope.messages + ' : ' + JSON.stringify(resp.result));
                        }
                    });
                });
        };
    });

/**
 * @ngdoc controller
 * @name ShowProductCtrl
 *
 * @description
 * A controller used for the Show conferences page.
 */
tiendaApp.controllers.controller('ShowProductCtrl', function ($scope, $log, oauth2Provider, HTTP_ERRORS) {

    /**
     * Holds the status if the query is being executed.
     * @type {boolean}
     */
    $scope.submitted = false;

    $scope.selectedTab = 'ALL';

    /**
     * Holds the filters that will be applied when queryConferencesAll is invoked.
     * @type {Array}
     */
    $scope.filters = [
    ];

    $scope.filtereableFields = [
        //{enumValue: 'CITY', displayName: 'City'},
        {enumValue: 'TOPIC', displayName: 'Topic'}//,
        //{enumValue: 'MONTH', displayName: 'Start month'},
        //{enumValue: 'MAX_ATTENDEES', displayName: 'Max Attendees'}
        
    ]

    /**
     * Possible operators.
     *
     * @type {{displayName: string, enumValue: string}[]}
     */
    $scope.operators = [
        {displayName: '=', enumValue: 'EQ'},
        {displayName: '>', enumValue: 'GT'},
        {displayName: '>=', enumValue: 'GTEQ'},
        {displayName: '<', enumValue: 'LT'},
        {displayName: '<=', enumValue: 'LTEQ'},
        {displayName: '!=', enumValue: 'NE'}
    ];

    /**
     * Holds the conferences currently displayed in the page.
     * @type {Array}
     */
    $scope.products = [];

    /**
     * Holds the state if offcanvas is enabled.
     *
     * @type {boolean}
     */
    $scope.isOffcanvasEnabled = false;

    /**
     * Sets the selected tab to 'ALL'
     */
    $scope.tabAllSelected = function () {
        $scope.selectedTab = 'ALL';
        $scope.queryProducts();
    };

    /**
     * Sets the selected tab to 'YOU_HAVE_CREATED'
     */
    $scope.tabYouHaveCreatedSelected = function () {
        $scope.selectedTab = 'YOU_HAVE_CREATED';
        if (!oauth2Provider.signedIn) {
            oauth2Provider.showLoginModal();
            return;
        }
        $scope.queryProducts();
    };

    /**
     * Sets the selected tab to 'YOU_WILL_ATTEND'
     */
    $scope.tabYouWillAttendSelected = function () {
        $scope.selectedTab = 'YOU_WILL_ATTEND';
        if (!oauth2Provider.signedIn) {
            oauth2Provider.showLoginModal();
            return;
        }
        $scope.queryProducts();
    };

    /**
     * Toggles the status of the offcanvas.
     */
    $scope.toggleOffcanvas = function () {
        $scope.isOffcanvasEnabled = !$scope.isOffcanvasEnabled;
    };

    /**
     * Namespace for the pagination.
     * @type {{}|*}
     */
    $scope.pagination = $scope.pagination || {};
    $scope.pagination.currentPage = 0;
    $scope.pagination.pageSize = 20;
    /**
     * Returns the number of the pages in the pagination.
     *
     * @returns {number}
     */
    $scope.pagination.numberOfPages = function () {
        return Math.ceil($scope.products.length / $scope.pagination.pageSize);
    };

    /**
     * Returns an array including the numbers from 1 to the number of the pages.
     *
     * @returns {Array}
     */
    $scope.pagination.pageArray = function () {
        var pages = [];
        var numberOfPages = $scope.pagination.numberOfPages();
        for (var i = 0; i < numberOfPages; i++) {
            pages.push(i);
        }
        return pages;
    };

    /**
     * Checks if the target element that invokes the click event has the "disabled" class.
     *
     * @param event the click event
     * @returns {boolean} if the target element that has been clicked has the "disabled" class.
     */
    $scope.pagination.isDisabled = function (event) {
        return angular.element(event.target).hasClass('disabled');
    }

    /**
     * Adds a filter and set the default value.
     */
    $scope.addFilter = function () {
        $scope.filters.push({
            field: $scope.filtereableFields[0],
            operator: $scope.operators[0],
            value: ''
        })
    };

    /**
     * Clears all filters.
     */
    $scope.clearFilters = function () {
        $scope.filters = [];
    };

    /**
     * Removes the filter specified by the index from $scope.filters.
     *
     * @param index
     */
    $scope.removeFilter = function (index) {
        if ($scope.filters[index]) {
            $scope.filters.splice(index, 1);
        }
    };

    /**
     * Query the conferences depending on the tab currently selected.
     *
     */
    $scope.queryProducts = function () {
        $scope.submitted = false;
        if ($scope.selectedTab == 'ALL') {
            $scope.queryProductsAll();
        } else if ($scope.selectedTab == 'YOU_HAVE_CREATED') {
            $scope.getProductsCreated();
        } else if ($scope.selectedTab == 'YOU_WILL_ATTEND') {
            $scope.getProductsAttend();
        }
    };

    /**
     * Invokes the conference.queryConferences API.
     */
    $scope.queryProductsAll = function () {
        var sendFilters = {
            filters: []
        }
        for (var i = 0; i < $scope.filters.length; i++) {
            var filter = $scope.filters[i];
            if (filter.field && filter.operator && filter.value) {
                sendFilters.filters.push({
                    field: filter.field.enumValue,
                    operator: filter.operator.enumValue,
                    value: filter.value
                });
            }
        }
        $scope.loading = true;
        // OJOJOJO gapi.client.conference.queryConferences(sendFilters).
        gapi.client.tienda.queryProducts(sendFilters).
            execute(function (resp) {
                $scope.$apply(function () {
                    $scope.loading = false;
                    if (resp.error) {
                        // The request has failed.
                        var errorMessage = resp.error.message || '';
                        $scope.messages = 'Failed to query products : ' + errorMessage;
                        $scope.alertStatus = 'warning';
                        $log.error($scope.messages + ' filters : ' + JSON.stringify(sendFilters));
                    } else {
                        // The request has succeeded.
                        $scope.submitted = false;
                        $scope.messages = 'Query succeeded : ' + JSON.stringify(sendFilters);
                        $scope.alertStatus = 'success';
                        $log.info($scope.messages);

                        $scope.products = [];
                        angular.forEach(resp.items, function (producto) {
                            $scope.products.push(producto);
                        });
                    }
                    $scope.submitted = true;
                });
            });
    }

    /**
     * Invokes the conference.getConferencesCreated method.
     */
    $scope.getProductsCreated = function () {
        $scope.loading = true;
        //gapi.client.conference.getConferencesCreated().
        gapi.client.tienda.getProductsCreated().
            execute(function (resp) {
                $scope.$apply(function () {
                    $scope.loading = false;
                    if (resp.error) {
                        // The request has failed.
                        var errorMessage = resp.error.message || '';
                        $scope.messages = 'Failed to query the products created : ' + errorMessage;
                        $scope.alertStatus = 'warning';
                        $log.error($scope.messages);

                        if (resp.code && resp.code == HTTP_ERRORS.UNAUTHORIZED) {
                            oauth2Provider.showLoginModal();
                            return;
                        }
                    } else {
                        // The request has succeeded.
                        $scope.submitted = false;
                        $scope.messages = 'Query succeeded : Products you have created';
                        $scope.alertStatus = 'success';
                        $log.info($scope.messages);

                        $scope.products = [];
                        angular.forEach(resp.items, function (producto) {
                            $scope.products.push(producto);
                        });
                    }
                    $scope.submitted = true;
                });
            });
    };

    /**
     * Retrieves the conferences to attend by calling the conference.getProfile method and
     * invokes the conference.getConference method n times where n == the number of the conferences to attend.
     */
    $scope.getProductsAttend = function () {
        $scope.loading = true;
        //gapi.client.conference.getConferencesToAttend().
        gapi.client.tienda.getProductsToAttend().
            execute(function (resp) {
                $scope.$apply(function () {
                    if (resp.error) {
                        // The request has failed.
                        var errorMessage = resp.error.message || '';
                        $scope.messages = 'Failed to query the products to buy : ' + errorMessage;
                        $scope.alertStatus = 'warning';
                        $log.error($scope.messages);

                        if (resp.code && resp.code == HTTP_ERRORS.UNAUTHORIZED) {
                            oauth2Provider.showLoginModal();
                            return;
                        }
                    } else {
                        // The request has succeeded.
                        $scope.products = resp.result.items;
                        $scope.loading = false;
                        $scope.messages = 'Query succeeded : Products you will Buy (or you have attended)';
                        $scope.alertStatus = 'success';
                        $log.info($scope.messages);
                    }
                    $scope.submitted = true;
                });
            });
    };
});


/**
 * @ngdoc controller
 * @name ProductDetailCtrl
 *
 * @description
 * A controller used for the conference detail page.
 */
tiendaApp.controllers.controller('ProductDetailCtrl', function ($scope, $log, $routeParams, HTTP_ERRORS) {
    $scope.producto = {};

    $scope.isUserAttending = false;

    /**
     * Initializes the conference detail page.
     * Invokes the conference.getConference method and sets the returned conference in the $scope.
     *
     */
    $scope.init = function () {
        $scope.loading = true;
        //gapi.client.conference.getConference({
        gapi.client.tienda.getProduct({
        	//OJOJOJOJOJOJOJ
            websafeProductKey: $routeParams.websafeProductKey
        }).execute(function (resp) {
            $scope.$apply(function () {
                $scope.loading = false;
                if (resp.error) {
                    // The request has failed.
                    var errorMessage = resp.error.message || '';
                    $scope.messages = 'Failed to get the product : ' + $routeParams.websafeKey
                        + ' ' + errorMessage;
                    $scope.alertStatus = 'warning';
                    $log.error($scope.messages);
                } else {
                    // The request has succeeded.
                    $scope.alertStatus = 'success';
                    $scope.producto = resp.result;
                }
            });
        });

        $scope.loading = true;
        // If the user is attending the conference, updates the status message and available function.
        //gapi.client.conference.getProfile().execute(function (resp) {
        gapi.client.tienda.getProfile().execute(function (resp) {
            $scope.$apply(function () {
                $scope.loading = false;
                if (resp.error) {
                    // Failed to get a user profile.
                } else {
                    var profile = resp.result;
                    for (var i = 0; i < profile.productKeysToAttend.length; i++) {
                        if ($routeParams.websafeProductKey == profile.productKeysToAttend[i]) {
                            // The user is attending the conference.
                            $scope.alertStatus = 'info';
                            $scope.messages = 'You are buy this product';
                            $scope.isUserAttending = true;
                        }
                    }
                }
            });
        });
    };


    /**
     * Invokes the conference.registerForConference method.
     */
    $scope.registerForProduct = function () {
        $scope.loading = true;
        //gapi.client.conference.registerForConference({
        gapi.client.tienda.registerForProduct({
            websafeProductKey: $routeParams.websafeProductKey
        }).execute(function (resp) {
            $scope.$apply(function () {
                $scope.loading = false;
                if (resp.error) {
                    // The request has failed.
                    var errorMessage = resp.error.message || '';
                    $scope.messages = 'Failed to register for the product : ' + errorMessage;
                    $scope.alertStatus = 'warning';
                    $log.error($scope.messages);

                    if (resp.code && resp.code == HTTP_ERRORS.UNAUTHORIZED) {
                        oauth2Provider.showLoginModal();
                        return;
                    }
                } else {
                    if (resp.result) {
                        // Register succeeded.
                        $scope.messages = 'buy the product';
                        $scope.alertStatus = 'success';
                        $scope.isUserAttending = true;
                        $scope.producto.seatsAvailable = $scope.producto.seatsAvailable - 1;
                    } else {
                        $scope.messages = 'Failed to buy the product';
                        $scope.alertStatus = 'warning';
                    }
                }
            });
        });
    };

    /**
     * Invokes the conference.unregisterForConference method.
     */
    $scope.unregisterFromProduct = function () {
        $scope.loading = true;
        //gapi.client.conference.unregisterFromConference({
        gapi.client.tienda.unregisterFromProduct({
            websafeProductKey: $routeParams.websafeProductKey
        }).execute(function (resp) {
            $scope.$apply(function () {
                $scope.loading = false;
                if (resp.error) {
                    // The request has failed.
                    var errorMessage = resp.error.message || '';
                    $scope.messages = 'Failed to unregister from the product : ' + errorMessage;
                    $scope.alertStatus = 'warning';
                    $log.error($scope.messages);
                    if (resp.code && resp.code == HTTP_ERRORS.UNAUTHORIZED) {
                        oauth2Provider.showLoginModal();
                        return;
                    }
                } else {
                    if (resp.result) {
                        // Unregister succeeded.
                        $scope.messages = 'Unregistered from the product';
                        $scope.alertStatus = 'success';
                        $scope.producto.seatsAvailable = $scope.producto.seatsAvailable + 1;
                        $scope.isUserAttending = false;
                        $log.info($scope.messages);
                    } else {
                        var errorMessage = resp.error.message || '';
                        $scope.messages = 'Failed to unregister from the product : ' + $routeParams.websafeKey +
                            ' : ' + errorMessage;
                        $scope.messages = 'Failed to unregister from the product';
                        $scope.alertStatus = 'warning';
                        $log.error($scope.messages);
                    }
                }
            });
        });
    };
});


/**
 * @ngdoc controller
 * @name RootCtrl
 *
 * @description
 * The root controller having a scope of the body element and methods used in the application wide
 * such as user authentications.
 *
 */
tiendaApp.controllers.controller('RootCtrl', function ($scope, $location, oauth2Provider) {

    /**
     * Returns if the viewLocation is the currently viewed page.
     *
     * @param viewLocation
     * @returns {boolean} true if viewLocation is the currently viewed page. Returns false otherwise.
     */
    $scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
    };

    /**
     * Returns the OAuth2 signedIn state.
     *
     * @returns {oauth2Provider.signedIn|*} true if siendIn, false otherwise.
     */
    $scope.getSignedInState = function () {
        return oauth2Provider.signedIn;
    };

    /**
     * Calls the OAuth2 authentication method.
     */
    $scope.signIn = function () {
        oauth2Provider.signIn(function () {
            gapi.client.oauth2.userinfo.get().execute(function (resp) {
                $scope.$apply(function () {
                    if (resp.email) {
                        oauth2Provider.signedIn = true;
                        $scope.alertStatus = 'success';
                        $scope.rootMessages = 'Logged in with ' + resp.email;
                    }
                });
            });
        });
    };

    /**
     * Render the signInButton and restore the credential if it's stored in the cookie.
     * (Just calling this to restore the credential from the stored cookie. So hiding the signInButton immediately
     *  after the rendering)
     */
    $scope.initSignInButton = function () {
        gapi.signin.render('signInButton', {
            'callback': function () {
                jQuery('#signInButton button').attr('disabled', 'true').css('cursor', 'default');
                if (gapi.auth.getToken() && gapi.auth.getToken().access_token) {
                    $scope.$apply(function () {
                        oauth2Provider.signedIn = true;
                    });
                }
            },
            'clientid': oauth2Provider.CLIENT_ID,
            'cookiepolicy': 'single_host_origin',
            'scope': oauth2Provider.SCOPES
        });
    };

    /**
     * Logs out the user.
     */
    $scope.signOut = function () {
        oauth2Provider.signOut();
        $scope.alertStatus = 'success';
        $scope.rootMessages = 'Logged out';
    };

    /**
     * Collapses the navbar on mobile devices.
     */
    $scope.collapseNavbar = function () {
        angular.element(document.querySelector('.navbar-collapse')).removeClass('in');
    };

});


/**
 * @ngdoc controller
 * @name OAuth2LoginModalCtrl
 *
 * @description
 * The controller for the modal dialog that is shown when an user needs to login to achive some functions.
 *
 */
tiendaApp.controllers.controller('OAuth2LoginModalCtrl',
    function ($scope, $modalInstance, $rootScope, oauth2Provider) {
        $scope.singInViaModal = function () {
            oauth2Provider.signIn(function () {
                gapi.client.oauth2.userinfo.get().execute(function (resp) {
                    $scope.$root.$apply(function () {
                        oauth2Provider.signedIn = true;
                        $scope.$root.alertStatus = 'success';
                        $scope.$root.rootMessages = 'Logged in with ' + resp.email;
                    });

                    $modalInstance.close();
                });
            });
        };
    });

/**
 * @ngdoc controller
 * @name DatepickerCtrl
 *
 * @description
 * A controller that holds properties for a datepicker.
 */
tiendaApp.controllers.controller('DatepickerCtrl', function ($scope) {
    $scope.today = function () {
        $scope.dt = new Date();
    };
    $scope.today();

    $scope.clear = function () {
        $scope.dt = null;
    };

    // Disable weekend selection
    $scope.disabled = function (date, mode) {
        return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
    };

    $scope.toggleMin = function () {
        $scope.minDate = ( $scope.minDate ) ? null : new Date();
    };
    $scope.toggleMin();

    $scope.open = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.opened = true;
    };

    $scope.dateOptions = {
        'year-format': "'yy'",
        'starting-day': 1
    };

    $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'shortDate'];
    $scope.format = $scope.formats[0];
});