tinymce.PluginManager.add('fontAwesomeSelector', function( editor ) {
	
	tinymce.DOM.loadCSS('../css/FontAwesome/all.min.css');
	tinymce.DOM.loadCSS('../css/FontAwesome/FaBrands.css');
	tinymce.DOM.loadCSS('../App_Plugins/TinyMceFontAwesomeSelector/Css/Container.css');
	
	var faIcons = [];
	selectedIcon = "";
	
	function showSelected (target) {
		var siblingIcons = target.parentElement.parentElement.parentElement.getElementsByClassName("fas");
		for(var i = 0; i < siblingIcons.length; i++){
			siblingIcons[i].removeAttribute("style"); 
		}

		target.style.color = 'red';
		target.style.transform = 'scale(1.5)';
	}
	
	fetch("../App_Plugins/TinyMceFontAwesomeSelector/Js/faIconsPrefixed.json")
	.then(response => response.json())
	.then(json => {
		json.Icons.forEach(icon => {
			faIcons.push({
				type: 'container',
				name: `${icon}`,
				html: `<i class="${icon}"></i><span class="tooltiptext">${icon}</span>`,
				onclick: function (e) {
					showSelected(e.target);
					selectedIcon = icon;
				}
			})
		});
	})
	
	function similarity(s1, s2) {
		var longer = s1;
		var shorter = s2;
		if (s1.length < s2.length) {
			longer = s2;
			shorter = s1;
		}
		var longerLength = longer.length;
		if (longerLength == 0) {
			return 1.0;
		}
	  return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
	}
	
	function editDistance(s1, s2) {
		s1 = s1.toLowerCase();
		s2 = s2.toLowerCase();

		var costs = new Array();
		for (var i = 0; i <= s1.length; i++) {
			var lastValue = i;
			for (var j = 0; j <= s2.length; j++) {
				if (i == 0) {
					costs[j] = j;
				}
				else {
					if (j > 0) {
						var newValue = costs[j - 1];
						if (s1.charAt(i - 1) != s2.charAt(j - 1)) {
							newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
						}
						costs[j - 1] = lastValue;
						lastValue = newValue;
					}
				}
			}
			if (i > 0) {
				costs[s2.length] = lastValue;
			}
		}
		return costs[s2.length];
	}
	
	editor.addButton( 'fontAwesomeSelector', {
		title: 'Icon Selector',
		icon: "emoticons",
		onclick: function() {
			var win = editor.windowManager.open({
				title: 'Select Icon',
				width: 720,
				height: 480,
				body: [
					{
						type: 'textbox',
						name: 'iconSearch',
						label: 'Search',
						value: '',
						onkeyup: function (e) {
							if (e.target.value.length > 3) {
								var foundIcons = faIcons.filter(icon => similarity(icon.name, e.target.value) > 0.3);
								setIconContainer(foundIcons);
							} else if (e.target.value.length === 0) {
								setIconContainer(faIcons);
							}

						}
					},
					{
						type: 'container',
						name: 'masterContainer',
						minWidth: '100%',
						classes: 'mastercontainer',
						items: [
							{
								type: 'container',
								name: 'iconContainer',
								minWidth: '100%',
								classes: 'dave',
								items: faIcons
							},
						]
					}
				],
				onsubmit: function (e) {
					if (selectedIcon != "") {
						editor.insertContent(`<i class="${selectedIcon}">&nbsp;</i>`);
						selectedIcon = "";
						tinymce.activeEditor.formatter.remove('italic')
					}
				}
			});
			
		
			function setIconContainer(foundIcons) {
				var masterContainer  = win.find("#masterContainer")[0];
				var iconContainer  = win.find("#iconContainer")[0];
				var newListbox = masterContainer.create({
					type: 'container',
					name: 'iconContainer',
					minWidth: '100%',
					classes: 'dave',
					items: foundIcons,
					toolTip: "IDK"
				}); 
				masterContainer.replace(iconContainer, newListbox[0]);
				masterContainer.renderNew();
			}
		}
	});
	

});