export const UserAvatar = ({name}) => {

	const initials = name
		.split(' ')
		.map((word) => word[0])
		.join('')
		.toUpperCase();

			const random = (arr) => {
			return arr[Math.floor(Math.random() * arr.length)];
		};

		const bgColor = random([ '#1D3557', '#000', '#333', '#3F51B5',  '#6A0DAD', '#0077CC', '#800020', '#00695C']);

	
	

	return ( 
		 <div
      className={`rounded-full flex items-center justify-center text-white font-semibold w-8 h-8 text-sm`}
			style={{ backgroundColor: bgColor }}
      title={name}
    >
      {initials}
    </div>
	 );
}
 
