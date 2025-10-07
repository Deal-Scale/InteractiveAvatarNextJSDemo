import React from "react";

interface UserVideoProps {
	userVideoStream: MediaStream | null;
}

export const UserVideo: React.FC<UserVideoProps> = ({ userVideoStream }) => {
	const videoRef = React.useRef<HTMLVideoElement>(null);

	React.useEffect(() => {
		if (videoRef.current && userVideoStream) {
			videoRef.current.srcObject = userVideoStream;
		}
	}, [userVideoStream]);

	return (
		<video
			ref={videoRef}
			autoPlay
			muted
			playsInline
			className="w-full h-full object-cover rounded-lg"
		/>
	);
};
