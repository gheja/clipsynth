Clipsynth = function(parent_object) {
	this.parent_object = document.getElementById(parent_object);
	this.width = 640;
	this.height = 480;
	
	this.clips = [];
	
	this.addClip = function(key, videos)
	{
		var i;
		
		var a = {
			videos: videos,
			key: key.toUpperCase(),
			status: 0,
			container_obj: null,
			video_obj: null,
			overlay_obj: null
		};
		
		a.container_obj = document.createElement("div");
		a.container_obj.className = "org_video_container";
		
		a.video_obj = document.createElement("video");
		for (i=0; i<videos.length; i++)
		{
			if ((videos[i].match(/\.(ogg|ogv)$/) && a.video_obj.canPlayType('video/ogg').length > 0) ||
				(videos[i].match(/\.(mp4)$/) && a.video_obj.canPlayType('video/mp4').length > 0) ||
				(videos[i].match(/\.(webm)$/) && a.video_obj.canPlayType('video/webm').length > 0))
			{
				a.video_obj.src = videos[i];
				break;
			}
		}
		if (a.video_obj.src == "")
		{
			console.log("Could not found any supported video formats for key \"" + key + "\"");
			return;
		}
		a.video_obj.preload = "auto";
		a.video_obj.addEventListener("playing", this.onVideoPlaying.bind(this, key));
		a.video_obj.addEventListener("ended", this.onVideoEnded.bind(this, key));
		a.video_obj.addEventListener("loadeddata", this.onVideoLoadedData.bind(this, key));
		
		a.overlay_obj = document.createElement("div");
		a.overlay_obj.className = "overlay";
		a.overlay_obj.innerHTML = key;
		
		a.container_obj.appendChild(a.video_obj);
		a.container_obj.appendChild(a.overlay_obj);
		
		this.clips.push(a);
		
		this.parent_object.appendChild(this.clips[this.clips.length - 1].container_obj);
	}
	
	this.onKeyDown = function(event)
	{
		var i;
		var key = String.fromCharCode(event.keyCode).toUpperCase();
		console.log('down: ' + key);
		for (i=0; i<this.clips.length; i++)
		{
			if (this.clips[i].key == key)
			{
				// stopped
				if (this.clips[i].status == 0)
				{
					this.clips[i].status = 1;
					this.clips[i].video_obj.currentTime = 0;
					this.clips[i].video_obj.loop = true;
					this.clips[i].video_obj.play();
				}
				// stopping
				else if (this.clips[i].status == 2)
				{
					this.clips[i].status = 1;
					this.clips[i].video_obj.currentTime = 0;
				}
				break;
			}
		}
	}
	
	this.onKeyUp = function(event)
	{
		var i;
		var key = String.fromCharCode(event.keyCode).toUpperCase();
		console.log('up: ' + key);
		for (i=0; i<this.clips.length; i++)
		{
			if (this.clips[i].key == key)
			{
				// playing
				if (this.clips[i].status == 1)
				{
					this.clips[i].status = 2;
					this.clips[i].video_obj.loop = false;
				}
				break;
			}
		}
	}
	
	this.reorganize = function()
	{
		var i, j, x, y, z, vw, vh, rows, cols, width, height;
		
		// TODO: should use width and height for this.parent_object
		this.width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
		this.height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
		
		if (this.clips.length <= 3)
		{
			rows = 1;
			cols = this.clips.length;
		}
		else
		{
			rows = Math.floor((this.clips.length - 1) / 4) + 1;
			cols = Math.ceil(this.clips.length / rows);
		}
		
		y = 0;
		x = 0;
		
		height = this.height / rows;
		width = this.width / cols;
		
		for (i=0; i<this.clips.length; i++)
		{
			if (x >= cols)
			{
				x = 0;
				y++;
				if (this.clips.length - i < cols)
				{
					width = this.width / (this.clips.length - i);
				}
				else
				{
					width = this.width / cols;
				}
			}
			this.clips[i].container_obj.style.left = Math.round(x * width) + "px";
			this.clips[i].container_obj.style.top = Math.round(y * height) + "px";
			this.clips[i].container_obj.style.width = Math.round(width) + "px";
			this.clips[i].container_obj.style.height = Math.round(height) + "px";
			
			if (this.clips[i].video_obj.readyState == 4)
			{
				vw = this.clips[i].video_obj.videoWidth;
				vh = this.clips[i].video_obj.videoHeight;
				z = Math.max(width/vw, height/vh);
				
				this.clips[i].video_obj.style.left = Math.round((vw * z) /2) + "px";
				this.clips[i].video_obj.style.top = Math.round((vh * z) / 2) + "px";
				this.clips[i].video_obj.style.width = Math.round(vw * z) + "px";
				this.clips[i].video_obj.style.height = Math.round(vh * z) + "px";
				this.clips[i].overlay_obj.style.top = Math.round(- ((vh * z) / 2 + 40)) + "px";
			}
			x++;
		}
	}
	
	this.onResize = function()
	{
		console.log('resize');
		this.reorganize();
	}
	
	this.onVideoPlaying = function(key)
	{
		var i;
		
		console.log('playing: ' + key);
		
		for (i=0; i<this.clips.length; i++)
		{
			if (this.clips[i].key == key)
			{
				this.clips[i].container_obj.className = "org_video_container org_video_container_playing";
				break;
			}
		}
	}
	
	this.onVideoEnded = function(key)
	{
		var i;
		
		console.log('ended: ' + key);
		
		for (i=0; i<this.clips.length; i++)
		{
			if (this.clips[i].key == key)
			{
				this.clips[i].status = 0;
//				this.clips[i].video_obj.currentTime = 0;
//				this.clips[i].video_obj.pause();
				this.clips[i].container_obj.className = "org_video_container";
				break;
			}
		}
	}
	
	this.onVideoLoadedData = function(key)
	{
		this.reorganize();
	}
};
