// inspired by Danny Stey 
// https://codepen.io/steylish/pen/YLxggB 

(() => {
    class Electricity {
        constructor(svg, parent) {
            this.svg = svg
            this.animationID
            this.parent = parent
            this.isHorizontal = true
            this.width = parent.offsetWidth
            this.height = parent.offsetHeight
            this.electricBranchPoints = 10
            this.percAllowedSpread = .35
            this.spaceBetweenPoints
            this.boltSpread
            this.startPoint
            this.endPoint
        }
        
        setPhysicalBoltProps(){
            this.spaceBetweenPoints = (this.isHorizontal ? this.width : this.height) / this.electricBranchPoints
            this.boltSpread = (this.isHorizontal ? this.height : this.width) * this.percAllowedSpread

            this.startPoint = this.isHorizontal ? 
                [0, this.height / 2] : 
                [this.width / 2, 0]
            
            this.endPoint = this.isHorizontal ? 
                [this.width, this.height /2 ] : 
                [this.width / 2, this.height]
        }
        
        render() {
            // svg attr d is draw path
            let pointsSVGd = this.isHorizontal ? 
                this.makeHorizontalPath() : 
                this.makeVerticalPath()
            let paths = this.svg.querySelectorAll('path')
            paths[0].setAttribute('d', pointsSVGd)
            paths[1].setAttribute('d', pointsSVGd)
        }

        makeHorizontalPath() {
            let branchPoints = [this.startPoint,]
            for(let i = 0; i < this.electricBranchPoints; i++) {
                let xPoint = (this.spaceBetweenPoints * i) + (Math.cos(i) * this.spaceBetweenPoints)
                let yPoint = this.plotInBoltRange(this.height) 
                branchPoints.push([xPoint, yPoint])
            }
            branchPoints.push(this.endPoint)
            let d = branchPoints.map((point) => point.join(','))
            return 'M' + d.join(',')
        }
        
        makeVerticalPath() {
            let branchPoints = [this.startPoint,]
            for(let i = 0; i < this.electricBranchPoints; i++) {
                let yPoint = (this.spaceBetweenPoints * i) + (Math.cos(i) * this.spaceBetweenPoints)
                let xPoint =  + this.plotInBoltRange(this.width)
                branchPoints.push([xPoint, yPoint])
            }
            branchPoints.push(this.endPoint)
            let d = branchPoints.map((point) => point.join(','))
            return 'M' + d.join(',')
        }
        
        randPosOrNeg(){
            return Math.random() < .5 ? 1 : -1
        }
        
        plotInBoltRange(dimension) {
            const baseline = dimension / 2
            return Math.random() * this.boltSpread/2 * this.randPosOrNeg() + baseline
        }
        
        resize(){
            this.width = this.parent.offsetWidth
            this.height = this.parent.offsetHeight
            this.setPhysicalBoltProps()
        }
        
        
        toggleHorizontal(bool){
            this.isHorizontal = bool
            this.setPhysicalBoltProps()
        }
        
        setBranchPoints(value) {
            this.electricBranchPoints = value
            this.setPhysicalBoltProps()
        }
        
        setSpread(value){
            this.percAllowedSpread = value / 100
            this.setPhysicalBoltProps()
        }
        
        // initialize at top level so other methods have access
        loop (){}
        
        start() {
            if(this.animationID) return
            this.setPhysicalBoltProps()
            let now, delta
            let fps = 25
            let then = Date.now()
            let interval = 1000/fps
            this.loop = () => {
                this.animationID = requestAnimationFrame(this.loop)
                now = Date.now()
                delta = now - then
                if (delta > interval) {
                    then = now - (delta % interval)
                    this.render()
                }
            }
            this.loop()
        }
        
        stop() {
            cancelAnimationFrame(this.animationID)
            this.animationID = null
        }
    } // end class
    
      
      /* configuration functions */
     
      // helper
    const toggleActiveButton = (toActive, toDisable) => {
        if(toActive.classList.value.lastIndexOf("active") === -1){
            toActive.classList.add("active")
            toDisable.classList.remove("active")
        }
    }

    const configureButtons = (electricity) => {
        const startButton = document.querySelector('.start')
        const pauseButton = document.querySelector('.pause')
        const hozButton = document.querySelector('.hoz')
        const vertButton = document.querySelector('.vert')
    
        startButton.classList.add("active")
        startButton.addEventListener("click", () => {
            toggleActiveButton(startButton, pauseButton)
            electricity.start()
        })
        
        pauseButton.addEventListener("click", () => {
            toggleActiveButton(pauseButton, startButton)
            electricity.stop()
        })
    
        hozButton.classList.add("active")
        hozButton.addEventListener("click", () => {
            toggleActiveButton(hozButton, vertButton)
            electricity.toggleHorizontal(true)
        })
        
        vertButton.addEventListener("click", () => {
            toggleActiveButton(vertButton, hozButton)
            electricity.toggleHorizontal(false)
        })
    }
    
      
    const configureSliders = (electricity) => {
        const branchSlider = document.querySelector("#branch-input")
        const spreadSlider = document.querySelector("#bolt-spread-input")
        branchSlider.addEventListener("input", () => electricity.setBranchPoints(branchSlider.value))
        spreadSlider.addEventListener("input", () => electricity.setSpread(spreadSlider.value))
    }
    
    const configureSVG = () => {
        const container = document.querySelector(".electric-container")
        const svg = document.querySelector("svg")
        const paths = document.querySelectorAll('path')

        const electricity = new Electricity(svg, container)
        const yMidPoint = container.offsetHeight/2
        const xLeftRestPoint = "0"
        const xRightRestPoint = `${container.offsetWidth}`
        const initElectricPath = `M${xLeftRestPoint},${yMidPoint},${xRightRestPoint},${yMidPoint}`
        paths.forEach(path => path.setAttribute("d", initElectricPath))
        return electricity
    }
    
    window.addEventListener("load", () => {
        const electricity = configureSVG()
        window.addEventListener("resize", () => electricity.resize())
        configureButtons(electricity)
        configureSliders(electricity)
        electricity.start()
    })
      
})()
    