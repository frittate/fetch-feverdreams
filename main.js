import axios from 'axios'

const userId = '391948300451971083'
const url = `https://api.feverdreams.app/userfeed/${userId}/50/1`
const { data } = await axios.get(url)

const allImages = data

console.log(allImages);