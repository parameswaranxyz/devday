/* eslint-env browser */
(function() {
  'use strict';

  // Check to make sure service workers are supported in the current browser,
  // and that the current page is accessed from a secure origin. Using a
  // service worker from an insecure origin will trigger JS console errors. See
  // http://www.chromium.org/Home/chromium-security/prefer-secure-origins-for-powerful-new-features
  var isLocalhost = Boolean(window.location.hostname === 'localhost' ||
      // [::1] is the IPv6 localhost address.
      window.location.hostname === '[::1]' ||
      // 127.0.0.1/8 is considered localhost for IPv4.
      window.location.hostname.match(
        /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
      )
    );

  if ('serviceWorker' in navigator &&
      (window.location.protocol === 'https:' || isLocalhost)) {
    navigator.serviceWorker.register('service-worker.js')
    .then(function(registration) {
      // Check to see if there's an updated version of service-worker.js with
      // new files to cache:
      // https://slightlyoff.github.io/ServiceWorker/spec/service_worker/index.html#service-worker-registration-update-method
      if (typeof registration.update === 'function') {
        registration.update();
      }

      // updatefound is fired if service-worker.js changes.
      registration.onupdatefound = function() {
        // updatefound is also fired the very first time the SW is installed,
        // and there's no need to prompt for a reload at that point.
        // So check here to see if the page is already controlled,
        // i.e. whether there's an existing service worker.
        if (navigator.serviceWorker.controller) {
          // The updatefound event implies that registration.installing is set:
          // https://slightlyoff.github.io/ServiceWorker/spec/service_worker/index.html#service-worker-container-updatefound-event
          var installingWorker = registration.installing;

          installingWorker.onstatechange = function() {
            switch (installingWorker.state) {
              case 'installed':
                // At this point, the old content will have been purged and the
                // fresh content will have been added to the cache.
                // It's the perfect time to display a "New content is
                // available; please refresh." message in the page's interface.
                break;

              case 'redundant':
                throw new Error('The installing ' +
                                'service worker became redundant.');

              default:
                // Ignore
            }
          };
        }
      };
    }).catch(function(e) {
      console.error('Error during service worker registration:', e);
    });
  }

  $(document).ready(function(){
    window.devDayRegister = function() {
        $('html, body').animate({
            scrollTop: $("#register-container").offset().top
        }, 1000);
      };
  });

  // Particles
  $('.devday-bg').particleground({
    dotColor: 'rgba(63, 81, 181, 0.45)',
    lineColor: '#9499B5',
    lineWidth: 0.25,
    particleRadius: 4,
    proximity: 100,
    density: 20000
  });

  // Scroll - Social Media icons
  var controller = new ScrollMagic.Controller({globalSceneOptions: {duration: 50000}});

  new ScrollMagic.Scene({triggerElement: ".section--presenter"})
        .setClassToggle(".section__presenter-container-icons", "active")
        .addTo(controller);

  // Sahaj Map
  function initialize_map(map_id, latitude, longitude) {
      var map_canvas = document.getElementById(map_id);
      var officeLocation = new google.maps.LatLng(latitude, longitude);
      var map_options = {
          center: officeLocation,
          zoom: 16,
          mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      var map = new google.maps.Map(map_canvas, map_options);
      var marker = new google.maps.Marker({
          position: officeLocation,
          map: map,
          title: "Sahaj Software Solutions Pvt. Ltd."
      });
      return map;
  }

  var sahajBangaloreMap = initialize_map('sahaj-bangalore-map', 12.924995, 77.627850);


  var $name = $("#devday-register-form input[name='name']"),
      $email = $("#devday-register-form input[name='email']"),
      $phone = $("#devday-register-form input[name='phone']");


  function registerCallBack() {
    $("#registration-success").removeClass("hidden");
    $("#registration").hide();
    $name.val('');
    $email.val('');
    $phone.val('');
  }

  function registerUser(name, email, phone) {
      $.ajax({
          url: "https://docs.google.com/forms/d/1_qsC8Er-qKfjWjgJ0BjrawalFCfoOO6Q4qOh2H5UDeI/formResponse",
          data: {
            "entry.799761301" : name,
            "entry.1111908573" : email,
            "entry.681310805": phone},
          type: "POST",
          dataType: "xml",
          crossDomain: true,
          statusCode: {
              0: function (){
                registerCallBack();
              },
              200: function (){
                registerCallBack();
              }
          }
      });
  }

  function validateName(name) {
    var re = /(\w+)\s*(\w+)/;
    return re.test(name);
  }

  function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  function validateMobile(mobile) {
    var re = /^(\+91-|\+91|0)?\d{10}$/;
    return re.test(mobile);
  }

  var success = {
    name: false,
    email: false,
    phone: false
  };

  function checkValidation(element, value) {
    if(value) {
      success[element[0].getAttribute("name")] = true;
      element.removeClass("error");
    } else {
      success[element[0].getAttribute("name")] = false;
      element.addClass("error");
    }
  }

  $name.on("keyup keypress", function() {
    checkValidation($name, validateName($name.val()));
  });

  $email.on("keyup keypress", function() {
    checkValidation($email, validateEmail($email.val()));
  });

  $phone.on("keyup keypress", function() {
    checkValidation($phone, validateMobile($phone.val()));
  });


  $("#sign-up-button").click(function(){
    var name = $name.val(),
        email = $email.val(),
        phone = $phone.val();

    checkValidation($name, validateName(name));
    checkValidation($email, validateEmail(email));
    checkValidation($phone, validateMobile(phone));

    if(success.name && success.email && success.phone) {
      registerUser(name, email, phone);
    }
  });

})();
