import Image from 'next/image'
import UserImage from '../../../public/user.webp'
import LogoImage from '../../../public/logo.png'
//temp comment updated
export default function Nav() {
    return (
      <nav className="w-screen bg-white shadow-lg flex justify-between px-4 py-1">
        {/* Fixed width for Logo */}
        <div className="w-[100px] flex-shrink-0">
          <Image src={LogoImage} width={80} height={80} alt="logo" />
        </div>
  
        <div className="flex gap-8 items-center">
          <button className="rounded-[20px] border border-[#53B175] px-6 py-3 w-[80px]">
            POS
          </button>
  
          <div className="flex items-center gap-3">
            <Image
              src={UserImage}
              alt="user-image"
              className="rounded-full w-[40px] h-[40px]"
              width={40}
              height={40}
            />
            <span>Kaviska Dilshan</span>
          </div>
        </div>
      </nav>
    );
  }
  