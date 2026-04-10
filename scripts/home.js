(function () {

    var $body = $('body'),
        $document = $(document),
        // Scene 1
        //$sceneTitle1 = $('.homeScene1 .title'),
        //$sceneBg1 = $('.homeScene1 .bg'),
        //Scene 2
        researchers = document.getElementById("researchers"),
        homes = document.getElementById("homes"),
        tests = document.getElementById("tests"),
        $sceneTitle2 = $('.leadingworld .title'),
        $brandItems = $('.leadingworld .brand-rnd .item'),
        $researchers = $('.leadingworld .brand-rnd .item .researchers .number'),
        $rnd = $('.leadingworld .brand-rnd .item .rnd-centre'),
        $homes = $('.leadingworld .brand-rnd .item .homes .number'),
        $testLab = $('.leadingworld .brand-rnd .item .test-lab'),
        $tests = $('.leadingworld .brand-rnd .item .tests .number'),
        $earth = $('.leadingworld .earth'),
        $testsMillion = $('.leadingworld .brand-rnd .tests .million'),
        $homesMillion = $('.leadingworld .brand-rnd .homes .million'),
        isMobile = {
            Android: function() {
                return navigator.userAgent.match(/Android/i);
            },
            BlackBerry: function() {
                return navigator.userAgent.match(/BlackBerry/i);
            },
            iOS: function() {
                return navigator.userAgent.match(/iPhone|iPad|iPod/i);
            },
            Opera: function() {
                return navigator.userAgent.match(/Opera Mini/i);
            },
            Windows: function() {
                return navigator.userAgent.match(/IEMobile/i);
            },
            any: function() {
                return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
            }
        };

    if(!isMobile.any()) {

        // Scene 2 Set
        TweenMax.set($sceneTitle2, { bottom: "-100px", opacity: 0 });
        TweenMax.set($brandItems, { bottom: -100, opacity: 0 });
        TweenMax.set($earth, { left: "-200px", bottom: "-100px", opacity: 0 });
        TweenMax.set($testsMillion, { opacity: 0, left: "-10px" });
        TweenMax.set($homesMillion, { opacity: 0, left: "-10px" });
        TweenMax.set(".tests2", { opacity: 0 });
        TweenMax.set(".homes2", { opacity: 0 });
        $tests.html('0');
        $researchers.html('0');
        $homes.html('0');

        var tl = new TimelineMax();

        var counter1 = { var: 10 };
        var counter2 = { var: 0 };
        var counter3 = { var: 0 };

        tl.to($sceneTitle2, 0.7, { bottom: "0px", opacity: 1, ease: Power4.easeOut })
          .staggerTo($brandItems, 0.3, { bottom: 0, opacity: 1, ease: Power4.easeOut }, 0.1)
          .to($earth, 2, { left: "-100px", bottom: "-50px", opacity: 1, ease: Circ.easeOut }, "-=1")
          .to(counter1, 1, { var: 451,
              onUpdate: function () {
                  researchers.innerHTML = Math.ceil(counter1.var);
              },
              ease:SlowMo.easeOut
          }, "-=1")

          .to(counter3, 2, { var: 999,
              onUpdate: function () {
                  tests.innerHTML = Math.ceil(counter3.var);
              },
              ease:SlowMo.easeOut
          }, "-=1")
          .to('.tests', 1, { opacity: 0, ease: Circ.easeOut }, "-=0.5")
          .to('.tests2', 1, { opacity: 1, ease: Circ.easeOut }, "-=0.5")

          .to(counter2, 2, { var: 999,
              onUpdate: function () {
                  homes.innerHTML = Math.ceil(counter2.var);
              },
              ease:SlowMo.easeOut
          }, "-=3")
          .to('.homes', 1, { opacity: 0, ease: Circ.easeOut }, "-=0.8")
          .to('.homes2', 0.6, { opacity: 1, ease: SlowMo.easeOut }, "-=1.3");

        var leadingWorld = new ScrollMagic.Scene({
            triggerElement: "#leadingWorld",
            reverse: false,
            // duration: 300,
            offset: -50
        })
        .setTween(tl)
        // .addIndicators({name: "Leading world"})
        .addTo(globalController);
        
    }

}());
