import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
interface CardProps{
    title:string;
    number:string
}

export default function Card({title,number}:CardProps) {
    return(
        <div className="shadow-lg rounded-[10px] bg-white p-8 flex gap-7 ">
        <ShoppingCartCheckoutIcon className=" text-gray-200 text-[30px]" style={{ fontSize: '55px' }}/>
        <div>
            <h1 className='text-[16px]'>{title}</h1>
            <p className='text-[28px] primary'>{number}</p>
        </div>

    </div>
    )
  
}