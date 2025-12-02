import {User} from "../../../types/interface";
import type ResponseDto from "../Response.dto";

export default interface GetSignInUserResponseDto extends ResponseDto, User{
    
}