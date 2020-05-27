function initDraggable(skipElements, skipNavigation) {
	var lis_elements = null
	var lis_navigation = null
	doInitDraggable()

	function doInitDraggable() {
		if (!skipElements) {
			lis_elements = document.querySelectorAll('#viewElements .reorder')
			configDragListeners(lis_elements)
		}
		if (!skipNavigation) {
			lis_navigation = document.querySelectorAll('#navElements .reorder')
			configDragListeners(lis_navigation)
		}
		var startIdx = null
		var endIdx = null
	}

	function configDragListeners(arr) {
		arr.forEach(function(li) {
			li.removeEventListener('dragstart', handleDragStart);
			li.removeEventListener('dragenter', handleDragEnter);
			li.removeEventListener('dragover', handleDragOver);
			li.removeEventListener('dragleave', handleDragLeave);
			li.removeEventListener('drop', handleDrop);
			li.removeEventListener('dragend', handleDragEnd);
		});

		arr.forEach(function(li) {
			li.addEventListener('dragstart', handleDragStart, false);
			li.addEventListener('dragenter', handleDragEnter, false);
			li.addEventListener('dragover', handleDragOver, false);
			li.addEventListener('dragleave', handleDragLeave, false);
			li.addEventListener('drop', handleDrop, false);
			li.addEventListener('dragend', handleDragEnd, false);
		});
	}

	function handleDragStart(e) {
		this.style.opacity = '0.4'
		startIdx = null
		endIdx = null
	}

	function handleDragOver(e) {
		if (e.preventDefault) {
			e.preventDefault()
		}
		e.dataTransfer.dropEffect = 'move'
		this.style.opacity = '1.0'
		return false
	}

	function handleDragEnter(e) {
		this.classList.add('over')
	}

	function handleDragLeave(e) {
		this.classList.remove('over')
	}

	function handleDrop(e) {
		if (e.stopPropagation) {
			e.stopPropagation()
		}
		startIdx = e.target.getAttribute('data-id')
		return false;
	}

	function handleDragEnd(e) {
		var ctx = e.target.getAttribute('data-ctx')
		var iter = ctx === 'nav' ? lis_navigation : lis_elements
		iter.forEach(function (li) {
			li.classList.remove('over')
		})
		endIdx = e.target.getAttribute('data-id')
		startIdx = Number.parseInt(startIdx)
		endIdx = Number.parseInt(endIdx)
		if (Number.isInteger(startIdx)&&
			Number.isInteger(endIdx)&&
			startIdx!==endIdx) {
			let _arr = ctx === 'nav' ? viewAgg[selectedView]['options'] : viewAgg[selectedView]['elements']
			var arr = JSON.parse(JSON.stringify(_arr))
			var objStart = new Object(_arr[startIdx])
			var objEnd = new Object(_arr[endIdx])
			arr[startIdx] = objEnd
			arr[endIdx] = objStart
			if (ctx === 'nav') {
				viewAgg[selectedView]['options'] = arr
			} else {
				viewAgg[selectedView]['elements'] = arr
			}
			elementsForView()
			elementsForNavigation()
			doInitDraggable()
		}
	}
}